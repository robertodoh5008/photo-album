from fastapi import HTTPException, status

from app.schemas.media import MediaCreateRequest
from app.utils.s3_client import generate_presigned_view_url, generate_presigned_download_url, delete_s3_object
from app.utils.supabase_client import SupabaseDB


def create_media(user_id: str, data: MediaCreateRequest, supabase: SupabaseDB) -> dict:
    if not data.s3_key.startswith(f"family-album/{user_id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="S3 key does not belong to this user",
        )

    row = {
        "user_id": user_id,
        "s3_key": data.s3_key,
        "type": data.type,
        "filename": data.filename,
        "size_bytes": data.size_bytes,
        "content_type": data.content_type,
    }
    result = supabase.insert("media", row)
    record = result[0]
    record["view_url"] = generate_presigned_view_url(data.s3_key)
    return record


def list_media(
    user_id: str, media_type: str | None, supabase: SupabaseDB
) -> list[dict]:
    filters = {"user_id": user_id}
    if media_type in ("image", "video"):
        filters["type"] = media_type

    items = supabase.select("media", filters=filters, order="created_at.desc")

    for item in items:
        item["view_url"] = generate_presigned_view_url(item["s3_key"])

    return items


def get_download_url(user_id: str, media_id: str, supabase: SupabaseDB) -> dict:
    rows = supabase.select("media", filters={"id": media_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    media = rows[0]

    if media["user_id"] != user_id:
        # Check family membership — member of the media owner's family
        family = supabase.select(
            "family_members",
            filters={"owner_id": media["user_id"], "member_id": user_id, "status": "accepted"},
        )
        if not family:
            # Check album collaborator access
            links = supabase.select("album_media", filters={"media_id": media_id})
            has_access = any(
                supabase.select("album_collaborators", filters={"album_id": link["album_id"], "user_id": user_id})
                for link in links
            )
            if not has_access:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    filename = media.get("filename") or "download"
    download_url = generate_presigned_download_url(media["s3_key"], filename)
    return {"download_url": download_url}


def delete_media(user_id: str, media_id: str, supabase: SupabaseDB) -> None:
    items = supabase.select("media", filters={"id": media_id, "user_id": user_id})
    if not items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    record = items[0]
    delete_s3_object(record["s3_key"])
    supabase.delete("media", filters={"id": media_id})
