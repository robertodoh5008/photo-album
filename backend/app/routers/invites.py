from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.albums import CollaboratorResponse
from app.services.album_service import accept_invite
from app.utils.supabase_client import get_supabase_admin

router = APIRouter()


@router.post("/{token}/accept", response_model=CollaboratorResponse)
def accept_invite_endpoint(
    token: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return accept_invite(user_id, token, supabase)
