"""
Security utilities for JWT validation, API key auth, and data encryption.

- JWT tokens come from Keycloak; we validate them using Keycloak's public key.
- API keys are hashed with SHA-256 for storage, compared at request time.
- Sensitive fields (API keys from providers) are encrypted with Fernet (AES-128).
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta
from typing import Any

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import get_db

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60 * 24) # 1 day
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    from app.tenants.models import User
    
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


# ── Fernet Encryption (for API keys at rest) ─────────────────────────────────


def _derive_fernet_key(secret: str) -> bytes:
    """
    Derive a Fernet-compatible key from the platform secret.
    Fernet requires a 32-byte URL-safe base64-encoded key.
    We use SHA-256 to derive it deterministically from the secret.
    """
    digest = hashlib.sha256(secret.encode()).digest()
    return urlsafe_b64encode(digest)


def encrypt_value(plaintext: str) -> str:
    """
    Encrypt a string value (e.g. an API key) for storage in the database.
    Returns a Fernet token as a UTF-8 string.
    """
    settings = get_settings()
    key = _derive_fernet_key(settings.secret_key)
    f = Fernet(key)
    return f.encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """
    Decrypt a Fernet-encrypted value from the database.
    Returns the original plaintext string.
    Raises ValueError if decryption fails (wrong key or tampered data).
    """
    settings = get_settings()
    key = _derive_fernet_key(settings.secret_key)
    f = Fernet(key)
    try:
        return f.decrypt(ciphertext.encode()).decode()
    except InvalidToken as exc:
        logger.error("Failed to decrypt value — key may have changed")
        raise ValueError("Decryption failed") from exc


# ── API Key Generation & Hashing ─────────────────────────────────────────────


def generate_api_key(prefix: str = "ob") -> tuple[str, str]:
    """
    Generate a new API key and its hash.

    Returns:
        (raw_key, hashed_key) — The raw key is shown to the user once.
        The hashed key is stored in the database for comparison.

    Format: ob_sk_<32 random hex chars>
    """
    raw = f"{prefix}_sk_{secrets.token_hex(32)}"
    hashed = hash_api_key(raw)
    return raw, hashed


def hash_api_key(raw_key: str) -> str:
    """Hash an API key with SHA-256 for secure storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


def verify_api_key(raw_key: str, hashed_key: str) -> bool:
    """Compare a raw API key against its stored hash (timing-safe)."""
    candidate = hash_api_key(raw_key)
    return hmac.compare_digest(candidate, hashed_key)


# ── Webhook Signature Validation ─────────────────────────────────────────────


def verify_webhook_signature(
    payload: bytes,
    signature: str,
    secret: str,
) -> bool:
    """
    Verify an HMAC-SHA256 webhook signature.
    Used for Chatwoot webhook authentication.
    """
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
