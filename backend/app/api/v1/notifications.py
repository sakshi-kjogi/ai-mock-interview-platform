import uuid

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import decode_token
from app.db.session import get_db
from app.core.ws_manager import manager
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.list_notifications(db, current_user.id)


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": notification_service.unread_count(db, current_user.id)}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.mark_read(db, current_user.id, notification_id)


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.mark_all_read(db, current_user.id)
    return {"status": "ok"}


@router.websocket("/ws")
async def notifications_ws(
    websocket: WebSocket,
    token: str = Query(...),  # browsers can't set custom headers on WS, so pass JWT as ?token=
    db: Session = Depends(get_db),
):
    # decode_token returns None on failure (per your security.py), not a raised exception.
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=4001)
        return

    try:
        user_id = uuid.UUID(payload["sub"])
    except (ValueError, TypeError):
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            # We don't expect the client to send anything meaningful; just keep
            # the connection alive and detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
