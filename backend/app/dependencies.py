from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx
import jwt
from jwt.algorithms import ECAlgorithm

from app.config import settings

security = HTTPBearer()

# Fetch JWKS from Supabase (requires apikey header)
_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    resp = httpx.get(
        f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json",
    )
    resp.raise_for_status()
    _jwks_cache = resp.json()
    return _jwks_cache


def _get_public_key(token: str):
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    jwks = _get_jwks()
    for key_data in jwks.get("keys", []):
        if key_data.get("kid") == kid:
            return ECAlgorithm(ECAlgorithm.SHA256).from_jwk(key_data)
    raise ValueError(f"No matching key found for kid: {kid}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials
    try:
        public_key = _get_public_key(token)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )
        return user_id
    except Exception as e:
        print(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
