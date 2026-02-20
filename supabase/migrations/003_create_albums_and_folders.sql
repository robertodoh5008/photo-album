-- Folders (organizational containers for albums)
CREATE TABLE public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders"
  ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders"
  ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders"
  ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders"
  ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Albums (contain media, optionally inside a folder)
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own albums"
  ON public.albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own albums"
  ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own albums"
  ON public.albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own albums"
  ON public.albums FOR DELETE USING (auth.uid() = user_id);

-- Junction table: album <-> media (many-to-many)
CREATE TABLE public.album_media (
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (album_id, media_id)
);

ALTER TABLE public.album_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own album_media"
  ON public.album_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.albums WHERE albums.id = album_media.album_id AND albums.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own album_media"
  ON public.album_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.albums WHERE albums.id = album_media.album_id AND albums.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own album_media"
  ON public.album_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.albums WHERE albums.id = album_media.album_id AND albums.user_id = auth.uid()
  ));
