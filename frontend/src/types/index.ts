export interface MediaItem {
  id: string;
  user_id: string;
  s3_key: string;
  view_url: string;
  type: "image" | "video";
  filename: string | null;
  size_bytes: number | null;
  content_type: string | null;
  created_at: string;
}

export type MediaFilter = "all" | "image" | "video";

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  description: string | null;
  cover_url: string | null;
  media_count: number;
  created_at: string;
  updated_at: string;
}

export type SortOption = "date" | "name";
