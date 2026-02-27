"use client";

import { useEffect, useState, useCallback } from "react";
import { Album } from "@/types";
import { apiFetch } from "@/lib/api";

export function useSharedAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShared = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Album[]>("/albums/shared");
      setAlbums(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shared albums");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShared();
  }, [fetchShared]);

  return { albums, loading, error, refetch: fetchShared };
}
