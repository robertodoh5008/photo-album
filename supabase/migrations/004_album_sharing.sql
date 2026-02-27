-- ── 004: Album Sharing & Access Control ─────────────────────────────

-- 1. Add visibility column to albums
ALTER TABLE public.albums
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'public'));

-- 2. Collaborators — keyed by user_id (populated when invite is accepted)
CREATE TABLE public.album_collaborators (
  album_id   UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'viewer'
             CHECK (role IN ('viewer', 'contributor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, user_id)
);

-- 3. Invites — email-based, token is a UUID used in the share link
CREATE TABLE public.album_invites (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id       UUID        NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  invited_email  TEXT        NOT NULL,
  role           TEXT        NOT NULL DEFAULT 'viewer'
                             CHECK (role IN ('viewer', 'contributor')),
  token          UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS: albums ──────────────────────────────────────────────────────
-- Replace the owner-only SELECT policy with one that also allows
-- public albums and invited collaborators.

DROP POLICY IF EXISTS "Users can view own albums" ON public.albums;

CREATE POLICY "Users can view accessible albums" ON public.albums
  FOR SELECT USING (
    visibility = 'public'
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.album_collaborators ac
      WHERE ac.album_id = albums.id
        AND ac.user_id = auth.uid()
    )
  );

-- ── RLS: album_collaborators ─────────────────────────────────────────
ALTER TABLE public.album_collaborators ENABLE ROW LEVEL SECURITY;

-- Album owner has full control over collaborator rows
CREATE POLICY "Owner can manage collaborators"
  ON public.album_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.albums
      WHERE albums.id = album_collaborators.album_id
        AND albums.user_id = auth.uid()
    )
  );

-- Each collaborator can read their own row
CREATE POLICY "Collaborator can view own row"
  ON public.album_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- ── RLS: album_invites ───────────────────────────────────────────────
ALTER TABLE public.album_invites ENABLE ROW LEVEL SECURITY;

-- Only album owner can read/write invites
CREATE POLICY "Owner can manage invites"
  ON public.album_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.albums
      WHERE albums.id = album_invites.album_id
        AND albums.user_id = auth.uid()
    )
  );

-- ── RLS: album_media — extend for collaborators + public ─────────────
DROP POLICY IF EXISTS "Users can view own album_media" ON public.album_media;

CREATE POLICY "Users can view accessible album_media"
  ON public.album_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.albums
      WHERE albums.id = album_media.album_id
        AND (
          albums.visibility = 'public'
          OR albums.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.album_collaborators ac
            WHERE ac.album_id = albums.id
              AND ac.user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert own album_media" ON public.album_media;

CREATE POLICY "Owner and contributors can insert album_media"
  ON public.album_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.albums
      WHERE albums.id = album_media.album_id
        AND (
          albums.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.album_collaborators ac
            WHERE ac.album_id = albums.id
              AND ac.user_id = auth.uid()
              AND ac.role = 'contributor'
          )
        )
    )
  );
