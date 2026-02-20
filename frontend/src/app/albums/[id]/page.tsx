"use client";

import { use } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAlbumMedia } from "@/hooks/useAlbumMedia";
import { MediaItem } from "@/types";
import { apiFetch } from "@/lib/api";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <AlbumContent albumId={id} />
    </ProtectedRoute>
  );
}

function AlbumContent({ albumId }: { albumId: string }) {
  const { media, loading, error, refetch, removeMedia } = useAlbumMedia(albumId);

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Remove this media from the album?")) return;
    try {
      await removeMedia(item.id);
    } catch {
      alert("Failed to remove media.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/gallery"
        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to albums
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Album</h1>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add photos
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={refetch} className="text-purple-600 font-medium hover:underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && <MediaGrid items={media} onDelete={handleDelete} />}
    </div>
  );
}
