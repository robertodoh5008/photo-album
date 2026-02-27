-- Family members: grant a user access to ALL of an owner's albums at once.
-- owner_id = the person who owns albums
-- member_id = the invited user (null until they accept)
-- token     = UUID used in the invite link /family-invite/{token}

CREATE TABLE public.family_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('viewer', 'contributor')),
  token         UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Owner can do anything with their family list
CREATE POLICY "Owner can manage family members" ON public.family_members
  FOR ALL USING (owner_id = auth.uid());

-- Member can read their own row (needed to display status on accept page)
CREATE POLICY "Member can view own row" ON public.family_members
  FOR SELECT USING (member_id = auth.uid());
