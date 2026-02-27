# Family Album

Private web app for family members to securely upload, store, and view shared photos and videos.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Supabase JS client
- **Backend**: FastAPI, Python, Supabase Python client, JWT verification
- **Database**: Supabase Postgres with Row Level Security
- **Storage**: AWS S3 (private bucket, presigned URLs)

## Architecture

- FastAPI runs as a standalone REST API on port 8000
- Next.js handles UI only (no API routes for business logic)
- Backend verifies Supabase JWTs and uses service_role key for DB ops
- Media stored in private AWS S3 bucket; served via presigned URLs (1hr expiry)
- Upload flow: Frontend → POST /uploads/presign → PUT to S3 → POST /media (metadata)

## Project Structure

```
Photo Album/
├── frontend/          # Next.js app (port 3000)
│   └── src/
│       ├── app/       # Pages: /, /login, /gallery, /upload
│       ├── components/ # auth/, layout/, media/, ui/, landing/
│       ├── lib/       # supabase.ts, api.ts
│       ├── hooks/     # useAuth.ts, useMedia.ts
│       └── types/     # TypeScript interfaces
├── backend/           # FastAPI app (port 8000)
│   └── app/
│       ├── main.py           # App entry, CORS
│       ├── config.py         # Env settings
│       ├── dependencies.py   # JWT auth
│       ├── routers/          # health.py, media.py, uploads.py
│       ├── schemas/          # Pydantic models
│       ├── services/         # Business logic
│       └── utils/            # Supabase client, S3 client
└── supabase/migrations/      # SQL for table + RLS + storage policies
```

## Commands

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend
cd backend && python -m pytest tests/ -v

# Frontend
cd frontend && npm run lint && npm run build
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| POST | /uploads/presign | Yes | Get presigned S3 upload URL |
| POST | /media | Yes | Save media metadata after S3 upload |
| GET | /media | Yes | List user's media (optional ?type=image\|video) |
| DELETE | /media/{id} | Yes | Delete media by ID (S3 + DB) |
| GET | /albums | Yes | List own albums |
| POST | /albums | Yes | Create album |
| GET | /albums/shared | Yes | List albums shared with current user |
| GET | /albums/{id} | Yes | Get album (owner or collaborator) |
| PATCH | /albums/{id} | Yes | Update album metadata (owner only) |
| DELETE | /albums/{id} | Yes | Delete album (owner only) |
| POST | /albums/{id}/share | Yes | Set visibility public/private (owner only) |
| GET | /albums/{id}/collaborators | Yes | List collaborators (owner only) |
| PATCH | /albums/{id}/collaborators/{user_id} | Yes | Change collaborator role (owner only) |
| DELETE | /albums/{id}/collaborators/{user_id} | Yes | Remove collaborator (owner only) |
| GET | /albums/{id}/invites | Yes | List pending invites (owner only) |
| POST | /albums/{id}/invites | Yes | Create invite link (owner only) |
| POST | /albums/{id}/invites/{invite_id}/revoke | Yes | Revoke invite (owner only) |
| GET | /albums/{id}/media | Yes | List album media (owner + collaborators) |
| POST | /albums/{id}/media | Yes | Add media to album (owner + contributors) |
| DELETE | /albums/{id}/media/{media_id} | Yes | Remove media from album (owner only) |
| POST | /invites/{token}/accept | Yes | Accept invite, become collaborator |
| GET | /public/albums/{id} | No | Get public album (visibility=public only) |
| GET | /public/albums/{id}/media | No | List public album media |
| GET | /public/invites/{token} | No | Preview invite info (no email exposed) |

## Sharing & Invites

### Overview
Albums have a `visibility` field: `'private'` (default) or `'public'`.

- **Public albums**: viewable at `/share/{id}` without signing in.
- **Private albums**: only accessible to the owner + collaborators (via invite).
- **Collaborators** have a role: `viewer` (read-only) or `contributor` (can add media).
- **Invites** are token-based links (`/invite/{token}`) that expire in 7 days.

### Setup
Run migration `004_album_sharing.sql` in the Supabase SQL editor before starting:
```sql
-- Run the contents of supabase/migrations/004_album_sharing.sql
```

### Invite Flow
1. Album owner opens the Share modal → enters an email + role → clicks Invite.
2. Backend creates a row in `album_invites` with a UUID token.
3. The modal shows the invite link: `{FRONTEND_URL}/invite/{token}`.
4. Owner copies and sends the link (e.g., via WhatsApp/email).
5. Invitee opens the link → sees album name + role preview → clicks "Accept invite".
6. If not logged in: redirected to `/login?redirectTo=/invite/{token}` and back after auth.
7. On accept: a row is inserted in `album_collaborators` and invite status → `accepted`.
8. The album now appears in the invitee's Gallery under "Shared with me".

### Permissions Summary
| Action | Owner | Contributor | Viewer | Public |
|--------|-------|-------------|--------|--------|
| View album & media | ✓ | ✓ | ✓ | ✓ |
| Add media | ✓ | ✓ | ✗ | ✗ |
| Remove media | ✓ | ✗ | ✗ | ✗ |
| Manage sharing | ✓ | ✗ | ✗ | ✗ |

## Database Schema

**Table: `public.media`**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `s3_key` (TEXT)
- `type` (TEXT: 'image' | 'video')
- `filename` (TEXT, nullable)
- `size_bytes` (BIGINT, nullable)
- `content_type` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)

RLS: Users can only SELECT/INSERT/DELETE their own rows.

## Environment Variables

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `NEXT_PUBLIC_API_URL` — Backend API URL (e.g., http://localhost:8000)

### Backend (`backend/.env`)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (never expose to client)
- `SUPABASE_JWT_SECRET` — JWT secret from Supabase dashboard
- `FRONTEND_URL` — Allowed CORS origin
- `AWS_ACCESS_KEY_ID` — AWS IAM access key
- `AWS_SECRET_ACCESS_KEY` — AWS IAM secret key
- `AWS_REGION` — S3 bucket region (e.g., us-east-2)
- `S3_BUCKET_NAME` — S3 bucket name

## Design System

- Inspired by MyAlbum.com — clean, minimal, image-first
- Purple palette: primary `#7c3aed`, accent `#a78bfa`
- Pill-shaped buttons, generous whitespace, rounded corners
- Responsive grid: 1 col mobile → 4 cols desktop
- Video: thumbnail with play icon in grid, modal lightbox on click

## Coding Conventions

- Frontend: functional components, hooks, TypeScript strict
- Backend: type hints, Pydantic models, async where appropriate
- All protected routes require valid Supabase JWT
- S3 key format: `family-album/{user_id}/{uuid}-{filename}`
