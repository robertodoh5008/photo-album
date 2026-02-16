"use client";

import { useEffect, useState, useCallback } from "react";
import { MediaItem, MediaFilter } from "@/types";
import { apiFetch } from "@/lib/api";

export function useMedia(filter: MediaFilter = "all") {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?type=${filter}` : "";
      const data = await apiFetch<MediaItem[]>(`/media${params}`);
      setMedia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, error, refetch: fetchMedia };
}
