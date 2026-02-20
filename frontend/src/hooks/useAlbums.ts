"use client";

import { useEffect, useState, useCallback } from "react";
import { Album, Folder, SortOption } from "@/types";
import { apiFetch } from "@/lib/api";

export function useAlbums(
  folderId: string | null = null,
  sortBy: SortOption = "date"
) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const albumParams = new URLSearchParams({ sort_by: sortBy });
      if (folderId) albumParams.set("folder_id", folderId);

      const folderParams = new URLSearchParams();
      if (folderId) folderParams.set("parent_folder_id", folderId);

      const [albumData, folderData] = await Promise.all([
        apiFetch<Album[]>(`/albums?${albumParams}`),
        apiFetch<Folder[]>(`/folders?${folderParams}`),
      ]);
      setAlbums(albumData);
      setFolders(folderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load albums");
    } finally {
      setLoading(false);
    }
  }, [folderId, sortBy]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { albums, folders, loading, error, refetch: fetch };
}
