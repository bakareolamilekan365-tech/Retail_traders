"""JWT utilities and authentication dependency for protected routes."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

ALGORITHM = "HS256"
DEFAULT_SECRET = "dev-secret-key"
DEFAULT_EXPIRE_DAYS = 7


def _get_secret_key() -> str:
    secret = os.getenv("SECRET_KEY", DEFAULT_SECRET)
    if not secret.strip():
        return DEFAULT_SECRET
    return secret


def create_access_token(
    subject: str,
    user_id: int | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token."""
    if not subject:
        raise ValueError("subject must be provided for token creation.")

    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=DEFAULT_EXPIRE_DAYS))
    payload: Dict[str, Any] = {"sub": subject, "exp": expire}
    if user_id is not None:
        payload["user_id"] = user_id

    secret_key = _get_secret_key()
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)


def get_current_user(authorization: str | None = Header(default=None)) -> Dict[str, Any]:
    """Validate a bearer token and return decoded claims."""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication header")

    secret_key = _get_secret_key()
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    return payload
