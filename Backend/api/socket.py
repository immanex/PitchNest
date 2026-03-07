from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import Dict, List, Annotated
import uuid
import json
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.database import AsyncSessionLocal, get_db
from db.models import Pitch, User, Room
from api.deps import get_current_active_user, get_current_user, get_user_from_token
from schemas.socket import RoomCreate
from db.models import User, ChatMessage
from ai.gemini import generate_gemini_response


router = APIRouter(prefix="/room", tags=["room"])


class ConnectionManager:
    def __init__(self):
        # Maps Room IDs to a list of active WebSockets
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

        # Maps User Email -> WebSocket (To find a specific person)
        self.email_to_socket: Dict[str, WebSocket] = {}

        # Maps WebSocket -> User Email (To clean up on disconnect)
        self.socket_to_email: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, room_id: str, email: str):

        await websocket.accept()

        if room_id not in self.rooms:
            self.rooms[room_id] = {}

        # store user
        self.rooms[room_id][email] = websocket
        self.email_to_socket[email] = websocket
        self.socket_to_email[websocket] = email

        print(f"✅ {email} connected to room: {room_id}")

        # send current users to the new client
        users = list(self.rooms[room_id].keys())

        await websocket.send_text(json.dumps({"action": "room-users", "users": users}))

        # notify others that a user joined
        await self.broadcast(
            json.dumps({"action": "user-joined", "email": email}), room_id
        )

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms and websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        email = self.socket_to_email.pop(websocket, None)

        if email and room_id in self.rooms:
            self.rooms[room_id].pop(email, None)

        if email:
            self.email_to_socket.pop(email, None)

        print(f"❌  disconnected from room: {room_id}")

    async def broadcast(self, message: str, room_id: str):
        """Send a message to everyone in the specific room."""
        for connection in self.rooms.get(room_id, {}).values():
            try:
                await connection.send_text(message)
            except Exception:
                # Handle stale connections
                pass

    async def send_to_user(self, message: str, email: str):
        ws = self.email_to_socket.get(email)

        if ws:
            await ws.send_text(message)


manager = ConnectionManager()


@router.get("/test")
async def test():
    return {"message": "Socket connection is working!"}


## room creation endpoint
@router.post("/create")
async def create_room(
    room_data: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):

    room_id = current_user.id + "-" + str(uuid.uuid4())[:8]

    room = Room(id=room_id, owner_id=current_user.id)

    pitch = Pitch(
        user_id=current_user.id,
        room_id=room_id,
        industry=room_data.get("industry"),
        startup_type=room_data.get("startup_type"),
        experience_level=room_data.get("experience_level"),
        mode=room_data.get("modeId", "Practice"),
    )

    db.add(room)
    db.add(pitch)

    await db.commit()

    return {"room_id": room_id}


@router.put("/end/{room_id}")
async def end_session(
    room_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = select(Room).where(Room.id == room_id)
    result = await db.execute(query)
    room = result.scalar_one_or_none()

    if room is None:
        return {"error": "Room not found"}

    if room.owner_id != current_user.id:
        return {"error": "Unauthorized"}

    # Here you can also update the pitch with final scores, feedback, etc.

    await db.delete(room)
    await db.commit()

    return {"message": "Session ended successfully"}


@router.get("/rooms")
async def list_rooms(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = select(Room).where(
        (Room.owner_id == current_user.id) & (Room.closed == False)
    )
    result = await db.execute(query)
    rooms = result.scalars().all()
    return {
        "rooms": [{"room_id": room.id, "owner_id": room.owner_id} for room in rooms]
    }


@router.get("/chats/{room_id}")
async def list_chats(
    room_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = (
        select(ChatMessage)
        .where(ChatMessage.room_id == room_id)
        .options(selectinload(ChatMessage.user))
        .order_by(ChatMessage.created_at)
    )

    result = await db.execute(query)
    chats = result.scalars().all()

    return [
        {
            "id": chat.id,
            "content": chat.content,
            "speaker": chat.user.full_name if chat.user else "AI Judge",
            "user_id": chat.user.id if chat.user else None,
        }
        for chat in chats
    ]




@router.websocket("/ws/{room_id}")
async def websocket_room(
    websocket: WebSocket,
    room_id: str,
):

    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    user = await get_user_from_token(token)  # your function

    if not user:
        await websocket.close(code=1008)
        return

    print(f"🚀 WebSocket connection request for room: {room_id}")
    async with AsyncSessionLocal() as db:
        query = select(Room.id).where(Room.id == room_id)
        result = await db.execute(query)
        room = result.scalar_one_or_none()

    if room is None:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, room_id, user.email)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data.get("action") == "send-message":

                # save user message
                async with AsyncSessionLocal() as db:
                    user_message = ChatMessage(
                        room_id=room_id,
                        user_id=message_data.get("user_id"),
                        content=message_data.get("text"),
                    )

                    db.add(user_message)
                    await db.commit()
                    await db.refresh(user_message)

                # broadcast user message
                await manager.broadcast(
                    json.dumps(
                        {
                            "action": "send-message",
                            "speaker": message_data.get("speaker"),
                            "text": user_message.content,
                        }
                    ),
                    room_id,
                )

                # generate AI response
                ai_response = await asyncio.to_thread(
                    generate_gemini_response, user_message.content
                )

                # save AI message
                async with AsyncSessionLocal() as db:
                    ai_message = ChatMessage(
                        room_id=room_id,
                        user_id=None,  # AI has no user
                        content=ai_response,
                    )

                    db.add(ai_message)
                    await db.commit()
                    await db.refresh(ai_message)

                # broadcast AI message
                await manager.broadcast(
                    json.dumps(
                        {
                            "action": "send-message",
                            "speaker": "AI Judge",
                            "text": ai_response,
                        }
                    ),
                    room_id,
                )
            elif message_data.get("action") == "call-user":
                email = message_data.get("user")
                offer = message_data.get("offer")
                from_user = manager.socket_to_email[websocket]
                socketId = manager.email_to_socket.get(email)

                if not socketId:
                    print("User not connected:", email)
                    continue
                await manager.send_to_user(
                    json.dumps(
                        {"action": "incoming-call", "from": from_user, "offer": offer}
                    ),
                    email,
                )
            elif message_data.get("action") == "call-accepted":
                email = message_data.get("to")
                answer = message_data.get("answer")

                from_user = manager.socket_to_email[websocket]

                await manager.send_to_user(
                    json.dumps(
                        {"action": "call-accepted", "from": from_user, "answer": answer}
                    ),
                    email,
                )

            elif message_data.get("action") == "ice-candidate":
                email = message_data.get("to")
                candidate = message_data.get("candidate")

                await manager.send_to_user(
                    json.dumps({
                        "action": "ice-candidate",
                        "candidate": candidate
                    }),
                    email
    )

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
