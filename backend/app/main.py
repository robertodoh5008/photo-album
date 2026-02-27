from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import albums, health, media, uploads
from app.routers import invites
from app.routers import public as public_router

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
app.include_router(albums.router, prefix="/albums", tags=["Albums"])
app.include_router(albums.folders_router, prefix="/folders", tags=["Folders"])
app.include_router(invites.router, prefix="/invites", tags=["Invites"])
app.include_router(public_router.router, prefix="/public", tags=["Public"])
