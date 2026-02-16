import uuid

import boto3
from botocore.config import Config

from app.config import settings

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            endpoint_url=f"https://s3.{settings.AWS_REGION}.amazonaws.com",
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


def generate_presigned_upload_url(
    user_id: str, filename: str, content_type: str
) -> dict:
    s3_key = f"family-album/{user_id}/{uuid.uuid4()}-{filename}"
    s3 = get_s3_client()
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": s3_key,
            "ContentType": content_type,
        },
        ExpiresIn=900,
    )
    return {"upload_url": upload_url, "s3_key": s3_key}


def generate_presigned_view_url(s3_key: str) -> str:
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": s3_key,
        },
        ExpiresIn=3600,
    )


def delete_s3_object(s3_key: str) -> None:
    s3 = get_s3_client()
    s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
