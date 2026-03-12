from fastapi import (
    WebSocket,
    WebSocketDisconnect,
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
)

from typing import Dict, List, Annotated
import uuid
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.database import AsyncSessionLocal, get_db
from db.models import Pitch, User, Room, AIRecommendation
from api.deps import get_current_active_user, get_current_user, get_user_from_token
from schemas.socket import RoomCreate
from db.models import User, ChatMessage
from ai.gemini import generate_gemini_response_stream, evaluate_pitch_with_gemini
from google.cloud import storage
import os
from utils.pdf_parser import extract_pitch_deck_text
from utils.session_manager import store_session, get_session_prompt, delete_session
from ai.gemini import _get_persona_prompt, build_system_prompt
from google.cloud import storage
import os

router = APIRouter(prefix="/room", tags=["room"])
BUCKET_NAME = "pitchnest-media"


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
            self.rooms[room_id] = {}  # email -> websocket

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
        email = self.socket_to_email.pop(websocket, None)
        if email:
            self.email_to_socket.pop(email, None)
        if room_id in self.rooms:
            if email:
                self.rooms[room_id].pop(email, None)
            else:
                for e, ws in list(self.rooms[room_id].items()):
                    if ws is websocket:
                        self.rooms[room_id].pop(e, None)
                        break
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        print(f"❌ {email or 'unknown'} disconnected from room: {room_id}")

    async def broadcast(
        self, message: str, room_id: str, exclude_ws: WebSocket | None = None
    ):
        """Send a message to everyone in the room. Iterate over a copy to avoid modification during send."""
        room = self.rooms.get(room_id, {})
        connections = list(room.values())
        for ws in connections:
            if exclude_ws and ws is exclude_ws:
                continue
            try:
                await ws.send_text(message)
            except Exception:
                pass

    async def send_to_user(self, message: str, email: str):
        ws = self.email_to_socket.get(email)

        if ws:
            await ws.send_text(message)


manager = ConnectionManager()


@router.get("/test")
async def test():
    return {"message": "Socket connection is working!"}


## upload pdf
async def upload_file_to_gcs(file):

    storage_client = storage.Client()

    bucket = storage_client.bucket(BUCKET_NAME)

    blob = bucket.blob(file.filename)

    contents = await file.read()

    blob.upload_from_string(contents, content_type=file.content_type)

    # print("File uploaded to GCS:", blob.authenticated_url)

    return blob.authenticated_url


## room creation endpoint
@router.post("/create")
async def create_room(
    pitch_name: str = Form(...),
    industry: str = Form(...),
    startup_type: str = Form(...),
    experience_level: str = Form(...),
    modeId: str = Form(...),
    investor_archetype: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):

    room_id = current_user.id + "-" + str(uuid.uuid4())[:8]

    url = await upload_file_to_gcs(file)

    deck_context = extract_pitch_deck_text(url)
    persona = _get_persona_prompt(investor_archetype)

    store_session(room_id, build_system_prompt(persona, deck_context))

    room = Room(id=room_id, owner_id=current_user.id)

    pitch = Pitch(
        pitch_name=pitch_name,
        pitch_pdf_url=url,
        user_id=current_user.id,
        room_id=room_id,
        industry=industry,
        startup_type=startup_type,
        experience_level=experience_level,
        mode=modeId,
        investor_archetype=investor_archetype,
    )

    db.add(room)
    db.add(pitch)

    await db.commit()

    return {"room_id": room_id, "pitch_id": pitch.id}


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

    # Get pitch for this room
    pitch_query = select(Pitch).where(Pitch.room_id == room_id)
    pitch_result = await db.execute(pitch_query)
    pitch = pitch_result.scalar_one_or_none()

    pitch_id = None
    if pitch:
        pitch_id = pitch.id
        # Build transcript from chat messages
        chat_query = (
            select(ChatMessage)
            .where(ChatMessage.room_id == room_id)
            .options(selectinload(ChatMessage.user))
            .order_by(ChatMessage.created_at)
        )
        chats_result = await db.execute(chat_query)
        chats = chats_result.scalars().all()
        transcript_parts = []
        for c in chats:
            speaker = c.user.full_name if c.user else "AI Judge"
            transcript_parts.append(f"{speaker}: {c.content}")
        transcript = "\n\n".join(transcript_parts) or "(No transcript)"
        print("Evaluating...")

        # Run AI evaluation
        eval_result = await asyncio.to_thread(evaluate_pitch_with_gemini, transcript)

        # Update pitch with scores and feedback
        pitch.overall_score = eval_result["overall_score"]
        pitch.clarity_score = eval_result["clarity"]
        pitch.communication_score = eval_result["communication"]
        pitch.market_fit_score = eval_result["market_fit"]
        pitch.verdict = eval_result["verdict"]
        pitch.feedback_summary = eval_result["feedback_summary"]

        # Create AIRecommendations
        for s in eval_result.get("strengths", []):
            db.add(AIRecommendation(pitch_id=pitch.id, category="strength", content=s))
        for w in eval_result.get("weaknesses", []):
            db.add(AIRecommendation(pitch_id=pitch.id, category="weakness", content=w))
        for s in eval_result.get("suggestions", []):
            db.add(
                AIRecommendation(pitch_id=pitch.id, category="suggestion", content=s)
            )
    print("Evaluated ✅")
    # Delete room (cascades to ChatMessages)
    await db.delete(room)
    await db.commit()

    return {
        "success": True,
        "message": "Session ended successfully",
        "pitch_id": pitch_id,
    }


@router.get("/rooms")
async def list_rooms(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = select(Room).where(Room.owner_id == current_user.id)
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

                # Fetch investor archetype and conversation history for dynamic questioning
                investor_archetype = None
                conversation_history = []
                async with AsyncSessionLocal() as db:
                    pitch_q = select(Pitch).where(Pitch.room_id == room_id)
                    pr = await db.execute(pitch_q)
                    p = pr.scalar_one_or_none()
                    if p:
                        investor_archetype = p.investor_archetype
                    chat_q = (
                        select(ChatMessage)
                        .where(ChatMessage.room_id == room_id)
                        .options(selectinload(ChatMessage.user))
                        .order_by(ChatMessage.created_at)
                    )
                    chat_res = await db.execute(chat_q)
                    prev_chats = chat_res.scalars().all()
                    conversation_history = [
                        {
                            "speaker": c.user.full_name if c.user else "AI Judge",
                            "content": c.content,
                        }
                        for c in prev_chats
                    ]

                # Stream AI response for faster perceived latency (producer in thread)
                loop = asyncio.get_event_loop()
                chunk_queue = asyncio.Queue()
                ai_response_parts = []
                system_prompt = get_session_prompt(room_id)

                def _produce_chunks():
                    try:
                        for chunk in generate_gemini_response_stream(
                            user_message.content,
                            system_prompt,
                            conversation_history,
                        ):
                            loop.call_soon_threadsafe(chunk_queue.put_nowait, chunk)
                    except Exception:
                        # Ensure the consumer doesn't hang if the producer fails mid-stream.
                        loop.call_soon_threadsafe(
                            chunk_queue.put_nowait,
                            "\n[AI error: failed to stream response. Please try again.]",
                        )
                    finally:
                        # Sentinel: always signal completion to unblock the consumer loop.
                        loop.call_soon_threadsafe(chunk_queue.put_nowait, None)

                with ThreadPoolExecutor(max_workers=1) as ex:
                    ex.submit(_produce_chunks)
                    while True:
                        chunk = await chunk_queue.get()
                        if chunk is None:
                            break
                        ai_response_parts.append(chunk)
                        await manager.broadcast(
                            json.dumps(
                                {
                                    "action": "ai-response-chunk",
                                    "speaker": "AI Judge",
                                    "chunk": chunk,
                                }
                            ),
                            room_id,
                        )

                ai_response = (
                    "".join(ai_response_parts).strip()
                    or "I'd like to hear more about your pitch."
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

                # broadcast final AI message (for transcript, TTS, etc.)
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
                to_email = message_data.get("to") or message_data.get("to_email")
                candidate = message_data.get("candidate")
                if to_email and candidate:
                    await manager.send_to_user(
                        json.dumps({"action": "ice-candidate", "candidate": candidate}),
                        to_email,
                    )

    except WebSocketDisconnect:
        email = manager.socket_to_email.get(websocket)
        manager.disconnect(websocket, room_id)
        delete_session(room_id)
        if email:
            await manager.broadcast(
                json.dumps({"action": "user-left", "email": email}),
                room_id,
            )
