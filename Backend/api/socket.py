from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import Dict, List, Annotated
import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.database import AsyncSessionLocal, get_db
from db.models import Pitch, User, Room
from api.deps import get_current_active_user
from schemas.socket import RoomCreate
from db.models import User, ChatMessage
from ai.gemini import generate_gemini_response


router = APIRouter(prefix="/room", tags=["room"])


class ConnectionManager:
    def __init__(self):
        # Maps Room IDs to a list of active WebSockets
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        # We accept the handshake here
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)
        print(f"✅ User connected to room: {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms and websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        print(f"❌ User disconnected from room: {room_id}")

    async def broadcast(self, message: str, room_id: str):
        """Send a message to everyone in the specific room."""
        for connection in self.rooms.get(room_id, []):
            try:
                await connection.send_text(message)
            except Exception:
                # Handle stale connections
                pass


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
    query = select(Room).where(Room.owner_id == current_user.id and Room.closed == False)
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
async def websocket_room(websocket: WebSocket, room_id: str):

    print(f"🚀 WebSocket connection request for room: {room_id}")

    async with AsyncSessionLocal() as db:
        query = select(Room.id).where(Room.id == room_id)
        result = await db.execute(query)
        room = result.scalar_one_or_none()

    if room is None:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, room_id)

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
                ai_response = generate_gemini_response(user_message.content)

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

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
