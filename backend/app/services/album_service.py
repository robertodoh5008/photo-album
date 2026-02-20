from fastapi import HTTPException, status

from app.schemas.albums import (
    AlbumCreateRequest,
    AlbumMediaRequest,
    AlbumUpdateRequest,
    FolderCreateRequest,
)
from app.utils.s3_client import generate_presigned_view_url
from app.utils.supabase_client import SupabaseDB


# ── Folders ──────────────────────────────────────────────────────────

def create_folder(user_id: str, data: FolderCreateRequest, supabase: SupabaseDB) -> dict:
    row = {"user_id": user_id, "name": data.name}
    if data.parent_folder_id:
        row["parent_folder_id"] = str(data.parent_folder_id)
    result = supabase.insert("folders", row)
    return result[0]


def list_folders(
    user_id: str,
    parent_folder_id: str | None,
    supabase: SupabaseDB,
) -> list[dict]:
    filters: dict = {"user_id": user_id}
    if parent_folder_id:
        filters["parent_folder_id"] = parent_folder_id
    else:
        filters["parent_folder_id"] = None
    return supabase.select("folders", filters=filters, order="name.asc")


def delete_folder(user_id: str, folder_id: str, supabase: SupabaseDB) -> None:
    items = supabase.select("folders", filters={"id": folder_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    supabase.delete("folders", filters={"id": folder_id})


# ── Albums ───────────────────────────────────────────────────────────

def create_album(user_id: str, data: AlbumCreateRequest, supabase: SupabaseDB) -> dict:
    row: dict = {"user_id": user_id, "name": data.name}
    if data.folder_id:
        row["folder_id"] = str(data.folder_id)
    if data.description:
        row["description"] = data.description
    result = supabase.insert("albums", row)
    record = result[0]
    record["cover_url"] = None
    record["media_count"] = 0
    return record


def list_albums(
    user_id: str,
    folder_id: str | None,
    sort_by: str,
    supabase: SupabaseDB,
) -> list[dict]:
    filters: dict = {"user_id": user_id}
    if folder_id:
        filters["folder_id"] = folder_id

    order = "name.asc" if sort_by == "name" else "created_at.desc"
    albums = supabase.select("albums", filters=filters, order=order)

    for album in albums:
        album["cover_url"] = _get_cover_url(album, supabase)
        album["media_count"] = _get_media_count(album["id"], supabase)

    return albums


def get_album(user_id: str, album_id: str, supabase: SupabaseDB) -> dict:
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    album = items[0]
    album["cover_url"] = _get_cover_url(album, supabase)
    album["media_count"] = _get_media_count(album["id"], supabase)
    return album


def update_album(
    user_id: str,
    album_id: str,
    data: AlbumUpdateRequest,
    supabase: SupabaseDB,
) -> dict:
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    values = data.model_dump(exclude_none=True)
    if "folder_id" in values:
        values["folder_id"] = str(values["folder_id"])
    if "cover_media_id" in values:
        values["cover_media_id"] = str(values["cover_media_id"])

    result = supabase.update("albums", values=values, filters={"id": album_id})
    record = result[0]
    record["cover_url"] = _get_cover_url(record, supabase)
    record["media_count"] = _get_media_count(album_id, supabase)
    return record


def delete_album(user_id: str, album_id: str, supabase: SupabaseDB) -> None:
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    supabase.delete("albums", filters={"id": album_id})


# ── Album Media ──────────────────────────────────────────────────────

def add_media_to_album(
    user_id: str,
    album_id: str,
    data: AlbumMediaRequest,
    supabase: SupabaseDB,
) -> None:
    # Verify album belongs to user
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    for media_id in data.media_ids:
        supabase.insert("album_media", {"album_id": album_id, "media_id": str(media_id)})


def remove_media_from_album(
    user_id: str,
    album_id: str,
    media_id: str,
    supabase: SupabaseDB,
) -> None:
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    supabase.delete("album_media", filters={"album_id": album_id, "media_id": media_id})


def list_album_media(
    user_id: str,
    album_id: str,
    supabase: SupabaseDB,
) -> list[dict]:
    items = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    links = supabase.select("album_media", filters={"album_id": album_id}, order="added_at.desc")
    media_items = []
    for link in links:
        rows = supabase.select("media", filters={"id": link["media_id"]})
        if rows:
            row = rows[0]
            row["view_url"] = generate_presigned_view_url(row["s3_key"])
            media_items.append(row)
    return media_items


# ── Helpers ──────────────────────────────────────────────────────────

def _get_cover_url(album: dict, supabase: SupabaseDB) -> str | None:
    cover_id = album.get("cover_media_id")
    if cover_id:
        rows = supabase.select("media", filters={"id": cover_id})
        if rows:
            return generate_presigned_view_url(rows[0]["s3_key"])

    # Fallback: use first media in album
    links = supabase.select("album_media", filters={"album_id": album["id"]}, order="added_at.asc")
    if links:
        rows = supabase.select("media", filters={"id": links[0]["media_id"]})
        if rows:
            return generate_presigned_view_url(rows[0]["s3_key"])
    return None


def _get_media_count(album_id: str, supabase: SupabaseDB) -> int:
    links = supabase.select("album_media", filters={"album_id": album_id})
    return len(links)
