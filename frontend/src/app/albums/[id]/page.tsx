"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAlbumMedia } from "@/hooks/useAlbumMedia";
import { MediaItem } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ShareModal from "@/components/albums/ShareModal";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <AlbumContent albumId={id} />
    </ProtectedRoute>
  );
}

function AlbumContent({ albumId }: { albumId: string }) {
  const { media, album, albumName, loading, error, refetch, removeMedia } = useAlbumMedia(albumId);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [showShare, setShowShare] = useState(false);

  const isOwner = album?.my_role === "owner";
  const canUpload = album?.my_role === "owner" || album?.my_role === "contributor";

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMedia(deleteTarget.id);
    } catch {
      alert("Failed to remove media.");
    }
    setDeleteTarget(null);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{albumName ?? "Album"}</h1>
          {album?.visibility === "public" && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Public
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share
            </button>
          )}
          {canUpload && (
            <Link
              href={`/upload?albumId=${albumId}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add photos
            </Link>
          )}
        </div>
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

      {!loading && !error && (
        <MediaGrid
          items={media}
          onDelete={isOwner ? setDeleteTarget : () => {}}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove from album"
          message="Are you sure you want to remove this from the album?"
          confirmLabel="Remove"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showShare && album && (
        <ShareModal
          albumId={albumId}
          albumName={albumName ?? "Album"}
          initialVisibility={album.visibility}
          onClose={() => setShowShare(false)}
          onVisibilityChange={() => refetch()}
        />
      )}
    </div>
  );
}
