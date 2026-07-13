import uuid

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.core.ws_manager import manager


def list_notifications(db: Session, user_id: uuid.UUID, limit: int = 30):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def unread_count(db: Session, user_id: uuid.UUID) -> int:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read.is_(False))
        .count()
    )


def mark_read(db: Session, user_id: uuid.UUID, notification_id: uuid.UUID):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
    return notif


def mark_all_read(db: Session, user_id: uuid.UUID):
    db.query(Notification).filter(
        Notification.user_id == user_id, Notification.is_read.is_(False)
    ).update({"is_read": True})
    db.commit()


async def create_notification(
    db: Session, user_id: uuid.UUID, type: str, title: str, description: str
) -> Notification:
    """Creates a notification row AND pushes it live over WebSocket to the
    user if they currently have a connection open. Call this from anywhere
    an event happens (interview completed, resume parsed, etc.)."""
    notif = Notification(
        user_id=user_id, type=type, title=title, description=description
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    await manager.send_to_user(
        user_id,
        {
            "id": str(notif.id),
            "type": notif.type,
            "title": notif.title,
            "description": notif.description,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat(),
        },
    )
    return notif
