from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_oauth(db: Session, provider: str, oauth_id: str) -> User | None:
    return (
        db.query(User)
        .filter(User.oauth_provider == provider, User.oauth_id == oauth_id)
        .first()
    )


def find_or_create_oauth_user(
    db: Session, provider: str, oauth_id: str, email: str, full_name: str
) -> User:
    """Handles three cases:
    1. User has logged in with this OAuth provider before -> return them.
    2. User previously registered with email/password using the same email
       -> link this OAuth provider to their existing account.
    3. Brand new user -> create an account with no password (OAuth-only).
    """
    existing_oauth_user = get_user_by_oauth(db, provider, oauth_id)
    if existing_oauth_user:
        return existing_oauth_user

    existing_email_user = get_user_by_email(db, email)
    if existing_email_user:
        existing_email_user.oauth_provider = provider
        existing_email_user.oauth_id = oauth_id
        db.commit()
        db.refresh(existing_email_user)
        return existing_email_user

    user = User(
        email=email,
        hashed_password=None,
        full_name=full_name,
        oauth_provider=provider,
        oauth_id=oauth_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user