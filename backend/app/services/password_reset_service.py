import hashlib
import secrets
import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User

TOKEN_EXPIRE_MINUTES = 30


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_reset_token(db: Session, user_id: uuid.UUID) -> str:
    """Generates a high-entropy raw token (sent to the user via email) and
    stores only its hash in the DB — same principle as password hashing:
    even if the DB leaks, tokens can't be reconstructed."""
    raw_token = secrets.token_urlsafe(32)
    token = PasswordResetToken(
        user_id=user_id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    )
    db.add(token)
    db.commit()
    return raw_token


def get_valid_token(db: Session, raw_token: str) -> PasswordResetToken | None:
    token_hash = _hash_token(raw_token)
    token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .first()
    )
    if not token or token.used or token.expires_at < datetime.utcnow():
        return None
    return token


def consume_token_and_reset_password(
    db: Session, token: PasswordResetToken, new_password: str
) -> None:
    user = db.query(User).filter(User.id == token.user_id).first()
    user.hashed_password = hash_password(new_password)
    token.used = True
    db.commit()