from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, media, uploads

app = FastAPI(title="Family Album API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(media.router, prefix="/media", tags=["Media"])
app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
