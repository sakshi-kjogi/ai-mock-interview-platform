from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.core.email import send_password_reset_email
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import PasswordChangeRequest, UserCreate, UserLogin, UserResponse
from app.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest
from app.services.user_service import create_user, get_user_by_email
from app.services import password_reset_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
def register(request: Request, data: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )
    return create_user(db, data)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        # Same message for both cases — prevents email enumeration.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
def change_password(
    request: Request,
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from your current password",
        )
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    # Returns 204 No Content on success — no body needed.


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)

    # Always return the same generic message whether or not the user exists —
    # this prevents attackers from using this endpoint to discover which
    # emails are registered (email enumeration).
    generic_response = {"message": "If an account with that email exists, a reset link has been sent."}

    if not user:
        return generic_response

    raw_token = password_reset_service.create_reset_token(db, user.id)
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

    try:
        send_password_reset_email(user.email, reset_link)
    except Exception:
        # Don't leak email-sending failures to the client — log server-side only.
        pass

    return generic_response


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    token = password_reset_service.get_valid_token(db, data.token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired. Please request a new one.",
        )
    password_reset_service.consume_token_and_reset_password(db, token, data.new_password)
    return {"message": "Password has been reset successfully. You can now log in."}