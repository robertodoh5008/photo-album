"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FilterBar } from "@/components/ui/FilterBar";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useMedia } from "@/hooks/useMedia";
import { MediaFilter, MediaItem } from "@/types";
import { apiFetch } from "@/lib/api";

export default function GalleryPage() {
  const [filter, setFilter] = useState<MediaFilter>("all");
  const { media, loading, error, refetch } = useMedia(filter);

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    try {
      await apiFetch(`/media/${item.id}`, { method: "DELETE" });
      refetch();
    } catch {
      alert("Failed to delete media.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Gallery</h1>
          <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="text-purple-600 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <MediaGrid items={media} onDelete={handleDelete} />
        )}
      </div>
    </ProtectedRoute>
  );
}
