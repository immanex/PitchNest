from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import Dict, List, Annotated
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from db.models import User
from api.deps import get_current_active_user
from db.models import Room
from schemas.socket import RoomCreate

router = APIRouter(prefix="/room", tags=["room"])
rooms = set()  # temporary in-memory storage


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms and websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast(self, message: str, room_id: str):
        for connection in self.rooms.get(room_id, []):
            await connection.send_text(message)


manager = ConnectionManager()


@router.get("/test")
async def test():
    return {"message": "Socket connection is working!"}


## room creation endpoint
@router.post("/create")
async def create_room(
    room_data: RoomCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    room_id = (
        current_user.id + "-" + str(uuid.uuid4())[:8]
    )  # unique room id based on user and random uuid

    room = Room(id=room_id, owner_id=current_user.id)
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return {"room_id": room_id}


## entering in the room
@router.websocket("/ws/{room_id}")
async def websocket_room(
    websocket: WebSocket, room_id: str, db: Annotated[AsyncSession, Depends(get_db)]
):

    query = select(Room.id).where(Room.id == room_id)
    result = await db.execute(query)
    room = result.scalar_one_or_none()

    if room is None:
        await websocket.close(code=1008)  # policy violation
        return

    await manager.connect(websocket, room_id)

    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, room_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
