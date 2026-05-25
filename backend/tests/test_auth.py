"""Tests for authentication endpoints."""

import sqlite3
import sys
import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock

import pytest
from fastapi.testclient import TestClient
from jose import jwt

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from api.auth import (
    create_access_token,
    hash_password,
    verify_password,
    SECRET_KEY,
    ALGORITHM,
)
from api.main import create_app


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE prediction_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                asset_symbol TEXT NOT NULL,
                predicted_return REAL NOT NULL,
                signal TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (username) REFERENCES users(username)
            )
        """)
        
        conn.commit()
        conn.close()
        yield str(db_path)


class TestPasswordHashing:
    """Test password hashing utilities."""
    
    def test_hash_password_creates_different_hash(self):
        """Test that hashing same password produces different hashes."""
        password = "testpass123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)
    
    def test_verify_password_correct(self):
        """Test that verify_password returns True for correct password."""
        password = "correctpass"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test that verify_password returns False for incorrect password."""
        hashed = hash_password("correctpass")
        assert verify_password("wrongpass", hashed) is False


class TestTokenGeneration:
    """Test JWT token generation."""
    
    def test_create_access_token_valid(self):
        """Test that created token can be decoded."""
        username = "testuser"
        token = create_access_token(username)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == username
    
    def test_create_access_token_has_expiry(self):
        """Test that token includes expiry."""
        token = create_access_token("testuser")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload
    
    def test_create_access_token_custom_expiry(self):
        """Test that custom expiry is used."""
        username = "testuser"
        delta = timedelta(hours=1)
        token = create_access_token(username, expires_delta=delta)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == username
        assert "exp" in payload


class TestAuthEndpoints:
    """Test authentication endpoints with mocking."""
    
    def test_register_success(self):
        """Test successful user registration with mocked db."""
        with mock.patch("api.auth.get_user_by_username", return_value=None):
            with mock.patch("api.auth.get_user_by_email", return_value=None):
                with mock.patch("api.auth.get_db_connection"):
                    app = create_app(load_on_startup=False)
                    client = TestClient(app)
                    
                    response = client.post(
                        "/api/v1/auth/register",
                        json={"username": "newuser", "email": "new@example.com", "password": "pass123"}
                    )
                    assert response.status_code == 201
                    data = response.json()
                    assert "access_token" in data
                    assert data["token_type"] == "bearer"
    
    def test_register_duplicate_username(self):
        """Test registration fails with duplicate username."""
        with mock.patch("api.auth.get_user_by_username") as mock_get_user:
            with mock.patch("api.auth.get_user_by_email", return_value=None):
                mock_get_user.return_value = {"username": "duplicate", "email": "first@example.com"}
                
                app = create_app(load_on_startup=False)
                client = TestClient(app)
                
                response = client.post(
                    "/api/v1/auth/register",
                    json={"username": "duplicate", "email": "second@example.com", "password": "pass123"}
                )
                assert response.status_code == 400
                assert "already taken" in response.json()["detail"]
    
    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email."""
        with mock.patch("api.auth.get_user_by_username", return_value=None):
            with mock.patch("api.auth.get_user_by_email") as mock_get_email:
                mock_get_email.return_value = {"username": "user1", "email": "dup@example.com"}
                
                app = create_app(load_on_startup=False)
                client = TestClient(app)
                
                response = client.post(
                    "/api/v1/auth/register",
                    json={"username": "user2", "email": "dup@example.com", "password": "pass123"}
                )
                assert response.status_code == 400
                assert "already registered" in response.json()["detail"]
    
    def test_login_success(self):
        """Test successful login."""
        hashed = hash_password("pass123")
        
        with mock.patch("api.auth.get_user_by_username") as mock_get_user:
            mock_get_user.return_value = {
                "username": "loginuser",
                "email": "login@example.com",
                "password_hash": hashed,
                "is_admin": False
            }
            
            app = create_app(load_on_startup=False)
            client = TestClient(app)
            
            response = client.post(
                "/api/v1/auth/login",
                json={"username": "loginuser", "password": "pass123"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        with mock.patch("api.auth.get_user_by_username", return_value=None):
            app = create_app(load_on_startup=False)
            client = TestClient(app)
            
            response = client.post(
                "/api/v1/auth/login",
                json={"username": "nonexistent", "password": "pass123"}
            )
            assert response.status_code == 401
            assert "Invalid username or password" in response.json()["detail"]
    
    def test_login_wrong_password(self):
        """Test login fails with wrong password."""
        hashed = hash_password("correctpass")
        
        with mock.patch("api.auth.get_user_by_username") as mock_get_user:
            mock_get_user.return_value = {
                "username": "user",
                "email": "user@example.com",
                "password_hash": hashed,
                "is_admin": False
            }
            
            app = create_app(load_on_startup=False)
            client = TestClient(app)
            
            response = client.post(
                "/api/v1/auth/login",
                json={"username": "user", "password": "wrongpass"}
            )
            assert response.status_code == 401
    
    def test_change_password_success(self):
        """Test successful password change."""
        old_hash = hash_password("oldpass123")
        
        with mock.patch("api.auth.get_user_by_username") as mock_get_user:
            mock_get_user.return_value = {
                "username": "changeuser",
                "email": "change@example.com",
                "password_hash": old_hash,
                "is_admin": False
            }
            
            with mock.patch("api.auth.get_db_connection"):
                app = create_app(load_on_startup=False)
                client = TestClient(app)
                
                # Get token
                login_response = client.post(
                    "/api/v1/auth/login",
                    json={"username": "changeuser", "password": "oldpass123"}
                )
                token = login_response.json()["access_token"]
                
                # Change password
                response = client.post(
                    "/api/v1/auth/change-password",
                    json={"old_password": "oldpass123", "new_password": "newpass123"},
                    headers={"Authorization": f"Bearer {token}"}
                )
                assert response.status_code == 200
                assert "successfully" in response.json()["message"]
    
    def test_change_password_invalid_old_password(self):
        """Test password change fails with wrong old password."""
        old_hash = hash_password("realpass")
        
        with mock.patch("api.auth.get_user_by_username") as mock_get_user:
            mock_get_user.return_value = {
                "username": "user",
                "email": "user@example.com",
                "password_hash": old_hash,
                "is_admin": False
            }
            
            app = create_app(load_on_startup=False)
            client = TestClient(app)
            
            # Get token
            login_response = client.post(
                "/api/v1/auth/login",
                json={"username": "user", "password": "realpass"}
            )
            token = login_response.json()["access_token"]
            
            # Try to change with wrong old password
            response = client.post(
                "/api/v1/auth/change-password",
                json={"old_password": "wrongoldpass", "new_password": "newpass123"},
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 401
            assert "Invalid old password" in response.json()["detail"]
    
    def test_change_password_requires_auth(self):
        """Test password change requires authentication."""
        app = create_app(load_on_startup=False)
        client = TestClient(app)
        
        response = client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "old", "new_password": "new"}
        )
        assert response.status_code == 401


class TestSmokeFlow:
    """Test complete authentication flow."""
    
    def test_token_generation_and_validation(self):
        """Test token generation and validation works end-to-end."""
        username = "flowuser"
        token = create_access_token(username)
        
        # Verify token can be decoded
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == username
        assert "exp" in payload

