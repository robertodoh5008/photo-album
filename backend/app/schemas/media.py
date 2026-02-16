from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    type: Literal["image", "video"]


class PresignResponse(BaseModel):
    upload_url: str
    s3_key: str


class MediaCreateRequest(BaseModel):
    s3_key: str
    type: Literal["image", "video"]
    filename: str
    size_bytes: int
    content_type: str


class MediaResponse(BaseModel):
    id: UUID
    user_id: UUID
    s3_key: str
    view_url: str
    type: Literal["image", "video"]
    filename: str | None = None
    size_bytes: int | None = None
    content_type: str | None = None
    created_at: datetime
