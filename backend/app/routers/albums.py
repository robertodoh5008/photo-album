from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.schemas.albums import (
    AlbumCreateRequest,
    AlbumMediaRequest,
    AlbumResponse,
    AlbumShareRequest,
    AlbumUpdateRequest,
    CollaboratorResponse,
    CollaboratorUpdateRequest,
    FolderCreateRequest,
    FolderResponse,
    InviteCreateRequest,
    InviteResponse,
)
from app.schemas.media import MediaResponse
from app.services.album_service import (
    add_media_to_album,
    create_album,
    create_folder,
    create_invite,
    delete_album,
    delete_folder,
    get_album,
    list_album_media,
    list_albums,
    list_collaborators,
    list_folders,
    list_invites,
    list_shared_albums,
    remove_collaborator,
    remove_media_from_album,
    revoke_invite,
    set_album_visibility,
    update_album,
    update_collaborator_role,
)
from app.utils.supabase_client import get_supabase_admin

router = APIRouter()
folders_router = APIRouter()


# ── Folders ──────────────────────────────────────────────────────────

@folders_router.post("", response_model=FolderResponse, status_code=201)
def create_folder_endpoint(
    body: FolderCreateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return create_folder(user_id, body, supabase)


@folders_router.get("", response_model=list[FolderResponse])
def list_folders_endpoint(
    parent_folder_id: str | None = Query(None),
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_folders(user_id, parent_folder_id, supabase)


@folders_router.delete("/{folder_id}", status_code=204)
def delete_folder_endpoint(
    folder_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    delete_folder(user_id, folder_id, supabase)


# ── Albums — static paths first ──────────────────────────────────────

@router.get("/shared", response_model=list[AlbumResponse])
def list_shared_albums_endpoint(
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_shared_albums(user_id, supabase)


# ── Albums — CRUD ────────────────────────────────────────────────────

@router.post("", response_model=AlbumResponse, status_code=201)
def create_album_endpoint(
    body: AlbumCreateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return create_album(user_id, body, supabase)


@router.get("", response_model=list[AlbumResponse])
def list_albums_endpoint(
    folder_id: str | None = Query(None),
    sort_by: str = Query("date", pattern="^(name|date)$"),
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_albums(user_id, folder_id, sort_by, supabase)


@router.get("/{album_id}", response_model=AlbumResponse)
def get_album_endpoint(
    album_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return get_album(user_id, album_id, supabase)


@router.patch("/{album_id}", response_model=AlbumResponse)
def update_album_endpoint(
    album_id: str,
    body: AlbumUpdateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return update_album(user_id, album_id, body, supabase)


@router.delete("/{album_id}", status_code=204)
def delete_album_endpoint(
    album_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    delete_album(user_id, album_id, supabase)


# ── Sharing ───────────────────────────────────────────────────────────

@router.post("/{album_id}/share", response_model=AlbumResponse)
def set_album_visibility_endpoint(
    album_id: str,
    body: AlbumShareRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return set_album_visibility(user_id, album_id, body.visibility, supabase)


# ── Collaborators ─────────────────────────────────────────────────────

@router.get("/{album_id}/collaborators", response_model=list[CollaboratorResponse])
def list_collaborators_endpoint(
    album_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_collaborators(user_id, album_id, supabase)


@router.patch("/{album_id}/collaborators/{target_user_id}", response_model=CollaboratorResponse)
def update_collaborator_role_endpoint(
    album_id: str,
    target_user_id: str,
    body: CollaboratorUpdateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return update_collaborator_role(user_id, album_id, target_user_id, body.role, supabase)


@router.delete("/{album_id}/collaborators/{target_user_id}", status_code=204)
def remove_collaborator_endpoint(
    album_id: str,
    target_user_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    remove_collaborator(user_id, album_id, target_user_id, supabase)


# ── Invites ───────────────────────────────────────────────────────────

@router.get("/{album_id}/invites", response_model=list[InviteResponse])
def list_invites_endpoint(
    album_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_invites(user_id, album_id, supabase)


@router.post("/{album_id}/invites", response_model=InviteResponse, status_code=201)
def create_invite_endpoint(
    album_id: str,
    body: InviteCreateRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return create_invite(user_id, album_id, body, supabase)


@router.post("/{album_id}/invites/{invite_id}/revoke", status_code=204)
def revoke_invite_endpoint(
    album_id: str,
    invite_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    revoke_invite(user_id, album_id, invite_id, supabase)


# ── Album Media ──────────────────────────────────────────────────────

@router.post("/{album_id}/media", status_code=204)
def add_media_endpoint(
    album_id: str,
    body: AlbumMediaRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    add_media_to_album(user_id, album_id, body, supabase)


@router.delete("/{album_id}/media/{media_id}", status_code=204)
def remove_media_endpoint(
    album_id: str,
    media_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    remove_media_from_album(user_id, album_id, media_id, supabase)


@router.get("/{album_id}/media", response_model=list[MediaResponse])
def list_album_media_endpoint(
    album_id: str,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase_admin()
    return list_album_media(user_id, album_id, supabase)
