from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.albums import (
    FamilyInviteRequest,
    FamilyMemberResponse,
    FamilyMemberUpdateRequest,
)
from app.services.album_service import (
    accept_family_invite,
    invite_family_member,
    list_family_members,
    remove_family_member,
    update_family_member_role,
)
from app.utils.supabase_client import get_supabase_admin

router = APIRouter()


@router.get("", response_model=list[FamilyMemberResponse])
def list_family_members_endpoint(user_id: str = Depends(get_current_user)):
    supabase = get_supabase_admin()
    return list_family_members(user_id, supabase)


@router.post("/invite", response_model=FamilyMemberResponse)
def invite_family_member_endpoint(
    data: FamilyInviteRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return invite_family_member(user_id, data.email, data.role, supabase)


@router.patch("/{record_id}", response_model=FamilyMemberResponse)
def update_family_member_role_endpoint(
    record_id: str,
    data: FamilyMemberUpdateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return update_family_member_role(user_id, record_id, data.role, supabase)


@router.delete("/{record_id}", status_code=204)
def remove_family_member_endpoint(
    record_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    remove_family_member(user_id, record_id, supabase)


@router.post("/invites/{token}/accept", response_model=FamilyMemberResponse)
def accept_family_invite_endpoint(
    token: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return accept_family_invite(user_id, token, supabase)
