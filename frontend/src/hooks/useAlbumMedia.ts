"use client";

import { useEffect, useState, useCallback } from "react";
import { Album, MediaItem } from "@/types";
import { apiFetch } from "@/lib/api";

export function useAlbumMedia(albumId: string) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, albumData] = await Promise.all([
        apiFetch<MediaItem[]>(`/albums/${albumId}/media`),
        apiFetch<Album>(`/albums/${albumId}`),
      ]);
      setMedia(data);
      setAlbum(albumData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load album media");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const addMedia = async (mediaIds: string[]) => {
    await apiFetch(`/albums/${albumId}/media`, {
      method: "POST",
      body: JSON.stringify({ media_ids: mediaIds }),
    });
    await fetchMedia();
  };

  const removeMedia = async (mediaId: string) => {
    await apiFetch(`/albums/${albumId}/media/${mediaId}`, {
      method: "DELETE",
    });
    await fetchMedia();
  };

  return {
    media,
    album,
    albumName: album?.name ?? null,
    loading,
    error,
    refetch: fetchMedia,
    addMedia,
    removeMedia,
  };
}
