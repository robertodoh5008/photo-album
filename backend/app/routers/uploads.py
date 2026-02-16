from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.media import PresignRequest, PresignResponse
from app.utils.s3_client import generate_presigned_upload_url

router = APIRouter()


@router.post("/presign", response_model=PresignResponse)
def presign_upload(
    body: PresignRequest,
    user_id: str = Depends(get_current_user),
):
    result = generate_presigned_upload_url(user_id, body.filename, body.content_type)
    return result
