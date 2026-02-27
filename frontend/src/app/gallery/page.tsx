"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlbums } from "@/hooks/useAlbums";
import { SortOption } from "@/types";
import { apiFetch } from "@/lib/api";
import AlbumOverviewToolbar from "@/components/albums/AlbumOverviewToolbar";
import OverviewGrid from "@/components/albums/OverviewGrid";
import CreateAlbumModal from "@/components/albums/CreateAlbumModal";
import CreateFolderModal from "@/components/albums/CreateFolderModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AlbumTile from "@/components/albums/AlbumTile";
import { useSharedAlbums } from "@/hooks/useSharedAlbums";
import Link from "next/link";

export default function GalleryPage() {
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "album" | "folder"; id: string; name: string } | null>(null);

  const { albums, folders, loading, error, refetch } = useAlbums(currentFolderId, sortBy);
  const { albums: sharedAlbums, loading: sharedLoading } = useSharedAlbums();

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBack = () => {
    setCurrentFolderId(null);
  };

  const handleDeleteAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId);
    setDeleteTarget({ type: "album", id: albumId, name: album?.name || "this album" });
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    setDeleteTarget({ type: "folder", id: folderId, name: folder?.name || "this folder" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const endpoint = deleteTarget.type === "album" ? `/albums/${deleteTarget.id}` : `/folders/${deleteTarget.id}`;
      await apiFetch(endpoint, { method: "DELETE" });
      refetch();
    } catch {
      alert(`Failed to delete ${deleteTarget.type}.`);
    }
    setDeleteTarget(null);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentFolderId && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to overview
          </button>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Album overview</h1>
          <Link
            href="/family"
            className="flex items-center gap-1.5 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Family
          </Link>
        </div>

        <AlbumOverviewToolbar
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewAlbum={() => setShowCreateAlbum(true)}
          onNewFolder={() => setShowCreateFolder(true)}
        />

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
          <OverviewGrid
            folders={folders}
            albums={albums}
            searchQuery={searchQuery}
            onFolderClick={handleFolderClick}
            onDeleteAlbum={handleDeleteAlbum}
            onDeleteFolder={handleDeleteFolder}
          />
        )}

        {showCreateAlbum && (
          <CreateAlbumModal
            folderId={currentFolderId}
            onClose={() => setShowCreateAlbum(false)}
            onCreated={refetch}
          />
        )}
        {showCreateFolder && (
          <CreateFolderModal
            parentFolderId={currentFolderId}
            onClose={() => setShowCreateFolder(false)}
            onCreated={refetch}
          />
        )}

        {/* Shared with me */}
        {!sharedLoading && sharedAlbums.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shared with me</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sharedAlbums.map((album) => (
                <AlbumTile
                  key={album.id}
                  album={album}
                />
              ))}
            </div>
          </div>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title={`Delete ${deleteTarget.type}`}
            message={
              deleteTarget.type === "album"
                ? `Delete "${deleteTarget.name}"? All photos and videos in this album will also be deleted.`
                : `Delete "${deleteTarget.name}"?`
            }
            confirmLabel="Delete"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
