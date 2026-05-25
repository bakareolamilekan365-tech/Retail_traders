"""Tests for admin-only endpoints."""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_SRC = Path(__file__).resolve().parents[1] / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.append(str(BACKEND_SRC))

from api.auth import hash_password
from api.main import create_app
from api.security import create_access_token


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


def _insert_user(db_path: Path, username: str, email: str, is_admin: bool) -> int:
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO users (username, email, password_hash, is_admin, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            """,
            (username, email, hash_password("password123"), int(is_admin)),
        )
        connection.commit()
        return int(cursor.lastrowid)


def _auth_headers(username: str, user_id: int) -> dict[str, str]:
    token = create_access_token(username, user_id=user_id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_client(tmp_path: Path) -> TestClient:
    app = create_app(load_on_startup=False)
    db_path = tmp_path / "app.db"
    _init_db(db_path)
    app.state.database_path = db_path
    return TestClient(app)


def test_admin_users_forbidden_for_normal_user(admin_client: TestClient) -> None:
    db_path = admin_client.app.state.database_path
    user_id = _insert_user(db_path, "user", "user@example.com", False)

    response = admin_client.get(
        "/api/v1/admin/users",
        headers=_auth_headers("user", user_id),
    )
    assert response.status_code == 403


def test_admin_users_returns_list(admin_client: TestClient) -> None:
    db_path = admin_client.app.state.database_path
    admin_id = _insert_user(db_path, "admin", "admin@example.com", True)
    _insert_user(db_path, "user", "user@example.com", False)

    response = admin_client.get(
        "/api/v1/admin/users",
        headers=_auth_headers("admin", admin_id),
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    usernames = {user["username"] for user in payload}
    assert {"admin", "user"} <= usernames


def test_admin_predictions_filters(admin_client: TestClient) -> None:
    db_path = admin_client.app.state.database_path
    admin_id = _insert_user(db_path, "admin", "admin@example.com", True)
    user_id = _insert_user(db_path, "user", "user@example.com", False)

    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (user_id, "BTC", "BUY", 2.5, 0.76),
        )
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (user_id, "ETH", "HOLD", 0.5, 0.55),
        )
        connection.commit()

    response = admin_client.get(
        f"/api/v1/admin/predictions?user_id={user_id}",
        headers=_auth_headers("admin", admin_id),
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2

    response = admin_client.get(
        "/api/v1/admin/predictions?asset=BTC",
        headers=_auth_headers("admin", admin_id),
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["asset"] == "BTC"


def test_admin_stats(admin_client: TestClient) -> None:
    db_path = admin_client.app.state.database_path
    admin_id = _insert_user(db_path, "admin", "admin@example.com", True)
    user_id = _insert_user(db_path, "user", "user@example.com", False)

    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (user_id, "BTC", "BUY", 2.5, 0.76),
        )
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (user_id, "BTC", "HOLD", 0.5, 0.55),
        )
        connection.execute(
            """
            INSERT INTO prediction_log (user_id, asset, signal, expected_return, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (admin_id, "ETH", "SELL", -1.5, 0.63),
        )
        connection.commit()

    response = admin_client.get(
        "/api/v1/admin/stats",
        headers=_auth_headers("admin", admin_id),
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_users"] == 2
    assert payload["total_predictions"] == 3
    assert payload["top_asset"] == "BTC"
    assert payload["most_active_user"] == "user"
