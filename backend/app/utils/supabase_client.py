import httpx
from app.config import settings

_headers = {
    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

REST_URL = f"{settings.SUPABASE_URL}/rest/v1"


class SupabaseDB:
    """Lightweight PostgREST wrapper using httpx."""

    def __init__(self):
        self._client = httpx.Client(base_url=REST_URL, headers=_headers, timeout=30)

    def insert(self, table: str, row: dict) -> list[dict]:
        resp = self._client.post(f"/{table}", json=row)
        resp.raise_for_status()
        return resp.json()

    def select(
        self,
        table: str,
        filters: dict | None = None,
        order: str | None = None,
    ) -> list[dict]:
        params = {"select": "*"}
        if filters:
            for key, val in filters.items():
                params[key] = f"eq.{val}"
        if order:
            params["order"] = order
        resp = self._client.get(f"/{table}", params=params)
        resp.raise_for_status()
        return resp.json()

    def delete(self, table: str, filters: dict) -> None:
        params = {}
        for key, val in filters.items():
            params[key] = f"eq.{val}"
        resp = self._client.delete(f"/{table}", params=params)
        resp.raise_for_status()


_db: SupabaseDB | None = None


def get_supabase_admin() -> SupabaseDB:
    global _db
    if _db is None:
        _db = SupabaseDB()
    return _db
