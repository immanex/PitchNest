# session_manager.py
_session_cache: dict[str, str] = {}  # room_id -> system_prompt

def store_session(room_id: str, system_prompt: str):
    _session_cache[room_id] = system_prompt

def get_session_prompt(room_id: str) -> str | None:
    return _session_cache.get(room_id)

def delete_session(room_id: str):
    _session_cache.pop(room_id, None)