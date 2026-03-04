from pydantic import BaseModel



class RoomCreate(BaseModel):
    user_id: str
    
class ChatMessageCreate(BaseModel):
    room_id: str
    user_id: str| None  # user_id can be None for AI messages
    content: str