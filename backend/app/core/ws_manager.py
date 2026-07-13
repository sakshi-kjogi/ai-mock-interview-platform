import uuid
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections per user_id so we can push
    notifications to a specific user in real time. A user can have
    multiple connections open (e.g. multiple tabs/devices)."""

    def __init__(self):
        self.active_connections: Dict[uuid.UUID, List[WebSocket]] = {}

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket):
        conns = self.active_connections.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns is not None and len(conns) == 0:
            self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: uuid.UUID, message: dict):
        conns = self.active_connections.get(user_id, [])
        dead = []
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


manager = ConnectionManager()
