"""Authentication endpoints for user registration, login, and password changes."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from api.security import create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    """Registration payload."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """Login payload."""

    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class ChangePasswordRequest(BaseModel):
    """Change password payload."""

    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    """Token response payload."""

    access_token: str
    token_type: str


class MessageResponse(BaseModel):
    """Generic message response payload."""

    message: str


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""

    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a stored hash."""

    return pwd_context.verify(plain, hashed)


def _get_db_path(request: Request) -> Path:
    db_path = getattr(request.app.state, "database_path", None)
    if db_path is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )
    return Path(db_path)


def _get_db_connection(db_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(str(db_path))
    connection.row_factory = sqlite3.Row
    return connection


def _get_user_by_username(username: str, db_path: Path) -> Dict[str, Any] | None:
    with _get_db_connection(db_path) as connection:
        row = connection.execute(
            "SELECT id, username, email, password_hash, is_admin FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    return dict(row) if row else None


def _get_user_by_email(email: str, db_path: Path) -> Dict[str, Any] | None:
    with _get_db_connection(db_path) as connection:
        row = connection.execute(
            "SELECT id, username, email, password_hash, is_admin FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    return dict(row) if row else None


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request) -> TokenResponse:
    """Register a new user and return an access token."""

    db_path = _get_db_path(request)
    if _get_user_by_username(payload.username, db_path):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    if _get_user_by_email(payload.email, db_path):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = hash_password(payload.password)
    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with _get_db_connection(db_path) as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (username, email, password_hash, is_admin, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (payload.username, payload.email, hashed_password, False, created_at),
            )
            user_id = cursor.lastrowid
            connection.commit()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        ) from exc

    token = create_access_token(payload.username, user_id=user_id)
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request) -> TokenResponse:
    """Validate credentials and return an access token."""

    db_path = _get_db_path(request)
    user = _get_user_by_username(payload.username, db_path)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token(user["username"], user_id=user["id"])
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> MessageResponse:
    """Change the password for the authenticated user."""

    username = current_user.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    db_path = _get_db_path(request)
    user = _get_user_by_username(username, db_path)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not verify_password(payload.old_password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid old password")

    new_hash = hash_password(payload.new_password)
    try:
        with _get_db_connection(db_path) as connection:
            connection.execute(
                "UPDATE users SET password_hash = ? WHERE username = ?",
                (new_hash, username),
            )
            connection.commit()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password",
        ) from exc

    return MessageResponse(message="Password changed successfully")
