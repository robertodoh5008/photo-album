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
  visibility: "private" | "public";
  my_role?: "owner" | "viewer" | "contributor";
  created_at: string;
  updated_at: string;
}

export type SortOption = "date" | "name";

export type ViewMode = "grid" | "book";
export type SpreadLayout = "hero-two" | "two-equal" | "hero-one";

export interface Spread {
  media: MediaItem[];
  layout: SpreadLayout;
}

export interface Collaborator {
  album_id: string;
  user_id: string;
  role: "viewer" | "contributor";
  email: string | null;
  created_at: string;
}

export interface AlbumInvite {
  id: string;
  album_id: string;
  invited_email: string;
  role: "viewer" | "contributor";
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
  invite_link: string;
}

export interface InvitePreview {
  album_id: string;
  album_name: string;
  role: string;
  status: string;
  expires_at: string;
}

export interface FamilyMember {
  id: string;
  owner_id: string;
  member_id: string | null;
  invited_email: string;
  email: string | null;
  role: "viewer" | "contributor";
  status: "pending" | "accepted" | "revoked";
  created_at: string;
  invite_link?: string;
}

export interface FamilyInvitePreview {
  owner_name: string;
  role: string;
  status: string;
}
