from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class FolderCreateRequest(BaseModel):
    name: str
    parent_folder_id: Optional[UUID] = None


class FolderResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    parent_folder_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class AlbumCreateRequest(BaseModel):
    name: str
    folder_id: Optional[UUID] = None
    description: Optional[str] = None


class AlbumResponse(BaseModel):
    id: UUID
    user_id: UUID
    folder_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    media_count: int = 0
    visibility: str = "private"
    my_role: Optional[str] = None  # 'owner' | 'viewer' | 'contributor'
    created_at: datetime
    updated_at: datetime


class AlbumUpdateRequest(BaseModel):
    name: Optional[str] = None
    folder_id: Optional[UUID] = None
    description: Optional[str] = None
    cover_media_id: Optional[UUID] = None


class AlbumMediaRequest(BaseModel):
    media_ids: list[UUID]


# ── Sharing ───────────────────────────────────────────────────────────

class AlbumShareRequest(BaseModel):
    visibility: str  # 'public' | 'private'


# ── Collaborators ─────────────────────────────────────────────────────

class CollaboratorResponse(BaseModel):
    album_id: UUID
    user_id: UUID
    role: str
    email: Optional[str] = None
    created_at: datetime


class CollaboratorUpdateRequest(BaseModel):
    role: str  # 'viewer' | 'contributor'


# ── Invites ───────────────────────────────────────────────────────────

class InviteCreateRequest(BaseModel):
    email: EmailStr
    role: str = "viewer"  # 'viewer' | 'contributor'


class InviteResponse(BaseModel):
    id: UUID
    album_id: UUID
    invited_email: str
    role: str
    token: UUID
    status: str
    expires_at: datetime
    created_at: datetime
    invite_link: str  # computed by service


class InvitePreviewResponse(BaseModel):
    """Public-safe invite info — no email exposed."""
    album_id: UUID
    album_name: str
    role: str
    status: str
    expires_at: datetime
