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
