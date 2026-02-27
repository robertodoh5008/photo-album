from datetime import datetime, timedelta, timezone
import threading
from fastapi import HTTPException, status
import httpx
import resend

from app.schemas.albums import (
    AlbumCreateRequest,
    AlbumMediaRequest,
    AlbumUpdateRequest,
    FolderCreateRequest,
    InviteCreateRequest,
)
from app.config import settings
from app.utils.s3_client import generate_presigned_view_url, delete_s3_object
from app.utils.supabase_client import SupabaseDB


# ── Access control helper ─────────────────────────────────────────────

def _check_album_access(user_id: str, album_id: str, supabase: SupabaseDB) -> tuple[dict, str]:
    """Return (album, role) or raise HTTP 404/403.

    role is one of: 'owner' | 'contributor' | 'viewer'
    """
    rows = supabase.select("albums", filters={"id": album_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    album = rows[0]

    if album["user_id"] == user_id:
        return album, "owner"

    collabs = supabase.select(
        "album_collaborators",
        filters={"album_id": album_id, "user_id": user_id},
    )
    if collabs:
        return album, collabs[0]["role"]  # 'viewer' | 'contributor'

    # Check family membership — gives access to all owner's albums
    family = supabase.select(
        "family_members",
        filters={"owner_id": album["user_id"], "member_id": user_id, "status": "accepted"},
    )
    if family:
        return album, family[0]["role"]

    if album.get("visibility") == "public":
        return album, "viewer"

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _require_owner(user_id: str, album_id: str, supabase: SupabaseDB) -> dict:
    """Return album dict or raise 403/404 if caller is not the owner."""
    rows = supabase.select("albums", filters={"id": album_id, "user_id": user_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    return rows[0]


def _get_user_email(user_id: str) -> str | None:
    """Fetch user email from Supabase Auth admin API using service role key."""
    try:
        resp = httpx.get(
            f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("email")
    except Exception:
        return None


def _auto_accept_pending_invites(user_id: str, email: str, supabase: SupabaseDB) -> None:
    """Accept any pending, unexpired album invites and family invites matching this user's email."""
    now = datetime.now(timezone.utc)

    # Album invites
    pending = supabase.select("album_invites", filters={"invited_email": email, "status": "pending"})
    for invite in pending:
        expires_at = datetime.fromisoformat(invite["expires_at"].replace("Z", "+00:00"))
        if now > expires_at:
            supabase.update("album_invites", values={"status": "expired"}, filters={"id": invite["id"]})
            continue
        album_id = invite["album_id"]
        role = invite["role"]
        existing = supabase.select("album_collaborators", filters={"album_id": album_id, "user_id": user_id})
        if existing:
            supabase.update(
                "album_collaborators",
                values={"role": role},
                filters={"album_id": album_id, "user_id": user_id},
            )
        else:
            supabase.insert("album_collaborators", {"album_id": album_id, "user_id": user_id, "role": role})
        supabase.update("album_invites", values={"status": "accepted"}, filters={"id": invite["id"]})

    # Family invites
    pending_family = supabase.select("family_members", filters={"invited_email": email, "status": "pending"})
    for fm in pending_family:
        supabase.update(
            "family_members",
            values={"member_id": user_id, "status": "accepted"},
            filters={"id": fm["id"]},
        )


def _send_invite_email(to_email: str, album_name: str, invite_link: str, role: str) -> None:
    """Send invite email via Resend. Silently skips if RESEND_API_KEY is not configured."""
    if not settings.RESEND_API_KEY:
        return
    try:
        action = "view" if role == "viewer" else "view and upload photos to"
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": f"You've been invited to \"{album_name}\"",
            "text": (
                f"You've been invited to {action} the album \"{album_name}\" on Family Album.\n\n"
                f"Click the link below to accept your invitation:\n{invite_link}\n\n"
                f"This invite expires in 7 days.\n"
                f"If you were not expecting this invite, you can ignore this email."
            ),
            "html": (
                f"<div style=\"font-family:sans-serif;max-width:480px;margin:auto;padding:32px\">"
                f"<h2 style=\"color:#111\">You've been invited</h2>"
                f"<p>You've been invited to {action} the album <strong>\"{album_name}\"</strong> on Family Album.</p>"
                f"<p style=\"margin:32px 0\">"
                f"<a href=\"{invite_link}\" style=\"background:#7c3aed;color:white;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600\">Accept Invite</a>"
                f"</p>"
                f"<p style=\"color:#6b7280;font-size:13px\">This invite expires in 7 days. If you were not expecting this, you can ignore this email.</p>"
                f"</div>"
            ),
        })
    except Exception as e:
        print(f"Email send failed (invite still created): {e}")


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
    record["my_role"] = "owner"
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
        album["my_role"] = "owner"

    return albums


def list_shared_albums(user_id: str, supabase: SupabaseDB) -> list[dict]:
    """Return albums the caller can access as a collaborator or family member (not as owner).
    Auto-accepts any pending email invites and family invites on first call.
    """
    email = _get_user_email(user_id)
    if email:
        _auto_accept_pending_invites(user_id, email, supabase)

    added_ids: set[str] = set()
    albums: list[dict] = []

    # Album-level collaborators
    collabs = supabase.select("album_collaborators", filters={"user_id": user_id})
    for collab in collabs:
        rows = supabase.select("albums", filters={"id": collab["album_id"]})
        if rows:
            album = rows[0]
            album["cover_url"] = _get_cover_url(album, supabase)
            album["media_count"] = _get_media_count(album["id"], supabase)
            album["my_role"] = collab["role"]
            added_ids.add(album["id"])
            albums.append(album)

    # Family members — get all albums belonging to the owner
    family_rows = supabase.select("family_members", filters={"member_id": user_id, "status": "accepted"})
    for fm in family_rows:
        owner_albums = supabase.select("albums", filters={"user_id": fm["owner_id"]})
        for album in owner_albums:
            if album["id"] not in added_ids:
                album["cover_url"] = _get_cover_url(album, supabase)
                album["media_count"] = _get_media_count(album["id"], supabase)
                album["my_role"] = fm["role"]
                added_ids.add(album["id"])
                albums.append(album)

    return albums


def get_album(user_id: str, album_id: str, supabase: SupabaseDB) -> dict:
    album, role = _check_album_access(user_id, album_id, supabase)
    album["cover_url"] = _get_cover_url(album, supabase)
    album["media_count"] = _get_media_count(album["id"], supabase)
    album["my_role"] = role
    return album


def update_album(
    user_id: str,
    album_id: str,
    data: AlbumUpdateRequest,
    supabase: SupabaseDB,
) -> dict:
    _require_owner(user_id, album_id, supabase)

    values = data.model_dump(exclude_none=True)
    if "folder_id" in values:
        values["folder_id"] = str(values["folder_id"])
    if "cover_media_id" in values:
        values["cover_media_id"] = str(values["cover_media_id"])

    result = supabase.update("albums", values=values, filters={"id": album_id})
    record = result[0]
    record["cover_url"] = _get_cover_url(record, supabase)
    record["media_count"] = _get_media_count(album_id, supabase)
    record["my_role"] = "owner"
    return record


def delete_album(user_id: str, album_id: str, supabase: SupabaseDB) -> None:
    _require_owner(user_id, album_id, supabase)

    # Delete all media linked to this album (S3 files + DB rows)
    links = supabase.select("album_media", filters={"album_id": album_id})
    for link in links:
        media_rows = supabase.select("media", filters={"id": link["media_id"]})
        if media_rows:
            delete_s3_object(media_rows[0]["s3_key"])
            supabase.delete("media", filters={"id": link["media_id"]})
    supabase.delete("album_media", filters={"album_id": album_id})
    supabase.delete("albums", filters={"id": album_id})


# ── Visibility / Sharing ─────────────────────────────────────────────

def set_album_visibility(
    user_id: str,
    album_id: str,
    visibility: str,
    supabase: SupabaseDB,
) -> dict:
    if visibility not in ("public", "private"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="visibility must be 'public' or 'private'")
    _require_owner(user_id, album_id, supabase)
    result = supabase.update("albums", values={"visibility": visibility}, filters={"id": album_id})
    record = result[0]
    record["cover_url"] = _get_cover_url(record, supabase)
    record["media_count"] = _get_media_count(album_id, supabase)
    record["my_role"] = "owner"
    return record


# ── Collaborators ─────────────────────────────────────────────────────

def list_collaborators(user_id: str, album_id: str, supabase: SupabaseDB) -> list[dict]:
    _require_owner(user_id, album_id, supabase)
    rows = supabase.select("album_collaborators", filters={"album_id": album_id}, order="created_at.asc")
    for row in rows:
        row["email"] = _get_user_email(row["user_id"])
    return rows


def update_collaborator_role(
    user_id: str,
    album_id: str,
    target_user_id: str,
    role: str,
    supabase: SupabaseDB,
) -> dict:
    if role not in ("viewer", "contributor"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role must be 'viewer' or 'contributor'")
    _require_owner(user_id, album_id, supabase)
    rows = supabase.select("album_collaborators", filters={"album_id": album_id, "user_id": target_user_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaborator not found")
    result = supabase.update(
        "album_collaborators",
        values={"role": role},
        filters={"album_id": album_id, "user_id": target_user_id},
    )
    return result[0]


def remove_collaborator(
    user_id: str,
    album_id: str,
    target_user_id: str,
    supabase: SupabaseDB,
) -> None:
    _require_owner(user_id, album_id, supabase)
    supabase.delete("album_collaborators", filters={"album_id": album_id, "user_id": target_user_id})


# ── Invites ───────────────────────────────────────────────────────────

def list_invites(user_id: str, album_id: str, supabase: SupabaseDB) -> list[dict]:
    _require_owner(user_id, album_id, supabase)
    invites = supabase.select("album_invites", filters={"album_id": album_id}, order="created_at.desc")
    for inv in invites:
        inv["invite_link"] = f"{settings.FRONTEND_URL}/invite/{inv['token']}"
    return invites


def create_invite(
    user_id: str,
    album_id: str,
    data: InviteCreateRequest,
    supabase: SupabaseDB,
) -> dict:
    if data.role not in ("viewer", "contributor"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role must be 'viewer' or 'contributor'")
    album = _require_owner(user_id, album_id, supabase)

    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    result = supabase.insert("album_invites", {
        "album_id": album_id,
        "invited_email": data.email,
        "role": data.role,
        "expires_at": expires_at,
    })
    invite = result[0]
    invite_link = f"{settings.FRONTEND_URL}/invite/{invite['token']}"
    invite["invite_link"] = invite_link

    threading.Thread(
        target=_send_invite_email,
        args=(data.email, album["name"], invite_link, data.role),
        daemon=True,
    ).start()

    return invite


def revoke_invite(
    user_id: str,
    album_id: str,
    invite_id: str,
    supabase: SupabaseDB,
) -> None:
    _require_owner(user_id, album_id, supabase)
    rows = supabase.select("album_invites", filters={"id": invite_id, "album_id": album_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    supabase.update("album_invites", values={"status": "revoked"}, filters={"id": invite_id})


def get_invite_preview(token: str, supabase: SupabaseDB) -> dict:
    """Public — returns album name + role without leaking invited_email."""
    rows = supabase.select("album_invites", filters={"token": token})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    invite = rows[0]

    # Check expiry
    expires_at = datetime.fromisoformat(invite["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        return {
            "album_id": invite["album_id"],
            "album_name": "",
            "role": invite["role"],
            "status": "expired",
            "expires_at": invite["expires_at"],
        }

    album_rows = supabase.select("albums", filters={"id": invite["album_id"]})
    album_name = album_rows[0]["name"] if album_rows else "Album"

    return {
        "album_id": invite["album_id"],
        "album_name": album_name,
        "role": invite["role"],
        "status": invite["status"],
        "expires_at": invite["expires_at"],
    }


def accept_invite(user_id: str, token: str, supabase: SupabaseDB) -> dict:
    rows = supabase.select("album_invites", filters={"token": token})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    invite = rows[0]

    if invite["status"] == "revoked":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite has been revoked")
    if invite["status"] == "accepted":
        # Idempotent — return existing collaborator row
        collab = supabase.select("album_collaborators", filters={"album_id": invite["album_id"], "user_id": user_id})
        if collab:
            return collab[0]
        # Invite accepted but no collaborator row (edge case) — fall through to create one

    expires_at = datetime.fromisoformat(invite["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite has expired")

    album_id = invite["album_id"]
    role = invite["role"]

    # Check if already a collaborator; if so, update role
    existing = supabase.select("album_collaborators", filters={"album_id": album_id, "user_id": user_id})
    if existing:
        result = supabase.update(
            "album_collaborators",
            values={"role": role},
            filters={"album_id": album_id, "user_id": user_id},
        )
        collab = result[0]
    else:
        result = supabase.insert("album_collaborators", {
            "album_id": album_id,
            "user_id": user_id,
            "role": role,
        })
        collab = result[0]

    # Mark invite accepted
    supabase.update("album_invites", values={"status": "accepted"}, filters={"id": invite["id"]})

    return collab


# ── Album Media ──────────────────────────────────────────────────────

def add_media_to_album(
    user_id: str,
    album_id: str,
    data: AlbumMediaRequest,
    supabase: SupabaseDB,
) -> None:
    album, role = _check_album_access(user_id, album_id, supabase)
    if role == "viewer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Viewers cannot add media")

    for media_id in data.media_ids:
        supabase.insert("album_media", {"album_id": album_id, "media_id": str(media_id)})


def remove_media_from_album(
    user_id: str,
    album_id: str,
    media_id: str,
    supabase: SupabaseDB,
) -> None:
    _require_owner(user_id, album_id, supabase)
    supabase.delete("album_media", filters={"album_id": album_id, "media_id": media_id})


def list_album_media(
    user_id: str,
    album_id: str,
    supabase: SupabaseDB,
) -> list[dict]:
    _check_album_access(user_id, album_id, supabase)

    links = supabase.select("album_media", filters={"album_id": album_id}, order="added_at.desc")
    media_items = []
    for link in links:
        rows = supabase.select("media", filters={"id": link["media_id"]})
        if rows:
            row = rows[0]
            row["view_url"] = generate_presigned_view_url(row["s3_key"])
            media_items.append(row)
    return media_items


# ── Public (no auth) ─────────────────────────────────────────────────

def get_public_album(album_id: str, supabase: SupabaseDB) -> dict:
    rows = supabase.select("albums", filters={"id": album_id})
    if not rows or rows[0].get("visibility") != "public":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    album = rows[0]
    album["cover_url"] = _get_cover_url(album, supabase)
    album["media_count"] = _get_media_count(album["id"], supabase)
    album["my_role"] = "viewer"
    return album


def list_public_album_media(album_id: str, supabase: SupabaseDB) -> list[dict]:
    rows = supabase.select("albums", filters={"id": album_id})
    if not rows or rows[0].get("visibility") != "public":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    links = supabase.select("album_media", filters={"album_id": album_id}, order="added_at.desc")
    media_items = []
    for link in links:
        media_rows = supabase.select("media", filters={"id": link["media_id"]})
        if media_rows:
            row = media_rows[0]
            row["view_url"] = generate_presigned_view_url(row["s3_key"])
            media_items.append(row)
    return media_items


# ── Family Members ───────────────────────────────────────────────────

def list_family_members(user_id: str, supabase: SupabaseDB) -> list[dict]:
    rows = supabase.select("family_members", filters={"owner_id": user_id}, order="created_at.desc")
    for row in rows:
        if row.get("member_id"):
            row["email"] = _get_user_email(row["member_id"])
        else:
            row["email"] = None
        row["invite_link"] = f"{settings.FRONTEND_URL}/family-invite/{row['token']}"
    return rows


def invite_family_member(
    user_id: str,
    email: str,
    role: str,
    supabase: SupabaseDB,
) -> dict:
    if role not in ("viewer", "contributor"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role must be 'viewer' or 'contributor'")
    result = supabase.insert("family_members", {
        "owner_id": user_id,
        "invited_email": email,
        "role": role,
    })
    row = result[0]
    invite_link = f"{settings.FRONTEND_URL}/family-invite/{row['token']}"
    row["invite_link"] = invite_link
    row["email"] = None

    # Get owner name for the email (best-effort)
    owner_email = _get_user_email(user_id) or "Someone"
    threading.Thread(
        target=_send_invite_email,
        args=(email, f"{owner_email}'s Family Album", invite_link, role),
        daemon=True,
    ).start()

    return row


def update_family_member_role(
    user_id: str,
    record_id: str,
    role: str,
    supabase: SupabaseDB,
) -> dict:
    if role not in ("viewer", "contributor"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="role must be 'viewer' or 'contributor'")
    rows = supabase.select("family_members", filters={"id": record_id, "owner_id": user_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
    result = supabase.update("family_members", values={"role": role}, filters={"id": record_id})
    row = result[0]
    row["invite_link"] = f"{settings.FRONTEND_URL}/family-invite/{row['token']}"
    row["email"] = _get_user_email(row["member_id"]) if row.get("member_id") else None
    return row


def remove_family_member(user_id: str, record_id: str, supabase: SupabaseDB) -> None:
    rows = supabase.select("family_members", filters={"id": record_id, "owner_id": user_id})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
    supabase.delete("family_members", filters={"id": record_id})


def get_family_invite_preview(token: str, supabase: SupabaseDB) -> dict:
    """Public — returns owner display name + role without leaking invited_email."""
    rows = supabase.select("family_members", filters={"token": token})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    fm = rows[0]
    owner_email = _get_user_email(fm["owner_id"]) or "A family member"
    return {
        "owner_name": owner_email,
        "role": fm["role"],
        "status": fm["status"],
    }


def accept_family_invite(user_id: str, token: str, supabase: SupabaseDB) -> dict:
    rows = supabase.select("family_members", filters={"token": token})
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    fm = rows[0]

    if fm["status"] == "revoked":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite has been revoked")
    if fm["status"] == "accepted":
        return fm  # idempotent

    result = supabase.update(
        "family_members",
        values={"member_id": user_id, "status": "accepted"},
        filters={"id": fm["id"]},
    )
    return result[0]


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
