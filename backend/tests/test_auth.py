"""Tests for authentication endpoints and utilities."""

from __future__ import annotations

import sqlite3
import sys
from datetime import timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from jose import jwt

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from api.auth import hash_password, verify_password
from api.main import create_app
from api.security import ALGORITHM, create_access_token, _get_secret_key


def _init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS prediction_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                asset TEXT NOT NULL,
                signal TEXT NOT NULL,
                expected_return REAL NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """
        )
        connection.commit()


@pytest.fixture()
def auth_client(tmp_path: Path) -> TestClient:
    app = create_app(load_on_startup=False)
    db_path = tmp_path / "app.db"
    _init_db(db_path)
    app.state.database_path = db_path
    return TestClient(app)


class TestPasswordHashing:
    """Unit tests for password hashing utilities."""

    def test_hash_password_creates_unique_hashes(self) -> None:
        password = "testpass123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

    def test_verify_password_success(self) -> None:
        password = "correctpass"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_failure(self) -> None:
        hashed = hash_password("correctpass")
        assert verify_password("wrongpass", hashed) is False


class TestTokenGeneration:
    """Unit tests for JWT creation."""

    def test_create_access_token_valid(self) -> None:
        token = create_access_token("testuser", user_id=1)
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
        assert payload["sub"] == "testuser"
        assert payload["user_id"] == 1

    def test_create_access_token_has_expiry(self) -> None:
        token = create_access_token("testuser")
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_create_access_token_custom_expiry(self) -> None:
        token = create_access_token("testuser", expires_delta=timedelta(hours=1))
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
        assert payload["sub"] == "testuser"
        assert "exp" in payload


class TestAuthEndpoints:
    """Integration tests for auth endpoints."""

    def test_register_success(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "newuser", "email": "new@example.com", "password": "pass123"},
        )
        assert response.status_code == 201
        payload = response.json()
        assert "access_token" in payload
        assert payload["token_type"] == "bearer"

    def test_register_duplicate_username(self, auth_client: TestClient) -> None:
        auth_client.post(
            "/api/v1/auth/register",
            json={"username": "duplicate", "email": "first@example.com", "password": "pass123"},
        )
        response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "duplicate", "email": "second@example.com", "password": "pass123"},
        )
        assert response.status_code == 400
        assert "already taken" in response.json()["detail"]

    def test_register_duplicate_email(self, auth_client: TestClient) -> None:
        auth_client.post(
            "/api/v1/auth/register",
            json={"username": "user1", "email": "dup@example.com", "password": "pass123"},
        )
        response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "user2", "email": "dup@example.com", "password": "pass123"},
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_login_success(self, auth_client: TestClient) -> None:
        auth_client.post(
            "/api/v1/auth/register",
            json={"username": "loginuser", "email": "login@example.com", "password": "pass123"},
        )
        response = auth_client.post(
            "/api/v1/auth/login",
            json={"username": "loginuser", "password": "pass123"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "access_token" in payload
        assert payload["token_type"] == "bearer"

    def test_login_invalid_credentials(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/api/v1/auth/login",
            json={"username": "missing", "password": "pass123"},
        )
        assert response.status_code == 401

    def test_change_password_success(self, auth_client: TestClient) -> None:
        register_response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "changeuser", "email": "change@example.com", "password": "oldpass123"},
        )
        token = register_response.json()["access_token"]

        response = auth_client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "oldpass123", "new_password": "newpass123"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200

        login_response = auth_client.post(
            "/api/v1/auth/login",
            json={"username": "changeuser", "password": "newpass123"},
        )
        assert login_response.status_code == 200

    def test_change_password_invalid_old_password(self, auth_client: TestClient) -> None:
        register_response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "user", "email": "user@example.com", "password": "realpass"},
        )
        token = register_response.json()["access_token"]

        response = auth_client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "wrongoldpass", "new_password": "newpass123"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401
        assert "Invalid old password" in response.json()["detail"]

    def test_change_password_requires_auth(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "old", "new_password": "new"},
        )
        assert response.status_code == 401


class TestSmokeFlow:
    """Smoke test for full auth flow."""

    def test_register_login_change_login(self, auth_client: TestClient) -> None:
        register_response = auth_client.post(
            "/api/v1/auth/register",
            json={"username": "flowuser", "email": "flow@example.com", "password": "initial123"},
        )
        assert register_response.status_code == 201

        login_response = auth_client.post(
            "/api/v1/auth/login",
            json={"username": "flowuser", "password": "initial123"},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        change_response = auth_client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "initial123", "new_password": "changed123"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert change_response.status_code == 200

        final_login = auth_client.post(
            "/api/v1/auth/login",
            json={"username": "flowuser", "password": "changed123"},
        )
        assert final_login.status_code == 200
