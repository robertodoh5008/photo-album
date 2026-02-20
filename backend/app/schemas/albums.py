from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


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
    created_at: datetime
    updated_at: datetime


class AlbumUpdateRequest(BaseModel):
    name: Optional[str] = None
    folder_id: Optional[UUID] = None
    description: Optional[str] = None
    cover_media_id: Optional[UUID] = None


class AlbumMediaRequest(BaseModel):
    media_ids: list[UUID]
