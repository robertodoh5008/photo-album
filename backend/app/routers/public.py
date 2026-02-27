"""Public (unauthenticated) endpoints for shared albums and invite previews."""
from fastapi import APIRouter

from app.schemas.albums import AlbumResponse, FamilyInvitePreview, InvitePreviewResponse
from app.schemas.media import MediaResponse
from app.services.album_service import (
    get_family_invite_preview,
    get_invite_preview,
    get_public_album,
    list_public_album_media,
)
from app.utils.supabase_client import get_supabase_admin

router = APIRouter()


@router.get("/albums/{album_id}", response_model=AlbumResponse)
def get_public_album_endpoint(album_id: str):
    supabase = get_supabase_admin()
    return get_public_album(album_id, supabase)


@router.get("/albums/{album_id}/media", response_model=list[MediaResponse])
def list_public_album_media_endpoint(album_id: str):
    supabase = get_supabase_admin()
    return list_public_album_media(album_id, supabase)


@router.get("/invites/{token}", response_model=InvitePreviewResponse)
def get_invite_preview_endpoint(token: str):
    supabase = get_supabase_admin()
    return get_invite_preview(token, supabase)


@router.get("/family-invites/{token}", response_model=FamilyInvitePreview)
def get_family_invite_preview_endpoint(token: str):
    supabase = get_supabase_admin()
    return get_family_invite_preview(token, supabase)
