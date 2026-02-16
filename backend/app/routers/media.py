from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.schemas.media import MediaResponse, MediaCreateRequest
from app.services.media_service import create_media, list_media, delete_media
from app.utils.supabase_client import get_supabase_admin

router = APIRouter()


@router.get("", response_model=list[MediaResponse])
def get_media(
    type: str | None = Query(None, pattern="^(image|video)$"),
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_media(user_id, type, supabase)


@router.post("", response_model=MediaResponse, status_code=201)
def save_media(
    body: MediaCreateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return create_media(user_id, body, supabase)


@router.delete("/{media_id}", status_code=204)
def remove_media(
    media_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    delete_media(user_id, media_id, supabase)
