"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlbums } from "@/hooks/useAlbums";
import { SortOption } from "@/types";
import AlbumOverviewToolbar from "@/components/albums/AlbumOverviewToolbar";
import OverviewGrid from "@/components/albums/OverviewGrid";
import CreateAlbumModal from "@/components/albums/CreateAlbumModal";
import CreateFolderModal from "@/components/albums/CreateFolderModal";

export default function GalleryPage() {
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const { albums, folders, loading, error, refetch } = useAlbums(currentFolderId, sortBy);

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBack = () => {
    setCurrentFolderId(null);
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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Album overview</h1>

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
      </div>
    </ProtectedRoute>
  );
}
