"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MediaItem, Album } from "@/types";
import { createSpreads } from "@/utils/spreadLayout";
import { apiFetch } from "@/lib/api";
import BookToolbar from "@/components/albums/BookToolbar";
import BookSpread from "@/components/albums/BookSpread";
import BookFilmstrip from "@/components/albums/BookFilmstrip";
import BookFooter from "@/components/albums/BookFooter";
import AddMediaModal from "@/components/albums/AddMediaModal";

interface BookViewProps {
  albumId: string;
  media: MediaItem[];
  onBack: () => void;
  onMediaChange: () => void;
}

export default function BookView({ albumId, media, onBack, onMediaChange }: BookViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bgColor, setBgColor] = useState("bg-gray-900");
  const [orderedMedia, setOrderedMedia] = useState<MediaItem[]>(media);
  const [showAddModal, setShowAddModal] = useState(false);
  const [albumName, setAlbumName] = useState("Album");
  const [transitioning, setTransitioning] = useState(false);

  // Sync orderedMedia when media prop changes (e.g. after adding photos)
  useEffect(() => {
    setOrderedMedia(media);
  }, [media]);

  // Fetch album name
  useEffect(() => {
    apiFetch<Album>(`/albums/${albumId}`)
      .then((album) => setAlbumName(album.name))
      .catch(() => {});
  }, [albumId]);

  const spreads = useMemo(() => createSpreads(orderedMedia), [orderedMedia]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < spreads.length && page !== currentPage) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentPage(page);
          setTransitioning(false);
        }, 150);
      }
    },
    [spreads.length, currentPage]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) return;
      if (e.key === "ArrowLeft") goToPage(currentPage - 1);
      if (e.key === "ArrowRight") goToPage(currentPage + 1);
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goToPage, onBack, showAddModal]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Drag-to-reorder: swap media items globally
  const handleReorder = useCallback(
    (fromLocalIndex: number, toLocalIndex: number) => {
      // Convert local spread indices to global media indices
      let globalOffset = 0;
      for (let i = 0; i < currentPage; i++) {
        globalOffset += spreads[i].media.length;
      }
      const fromGlobal = globalOffset + fromLocalIndex;
      const toGlobal = globalOffset + toLocalIndex;

      setOrderedMedia((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromGlobal, 1);
        next.splice(toGlobal, 0, moved);
        return next;
      });
    },
    [currentPage, spreads]
  );

  const handleAddMedia = async (mediaIds: string[]) => {
    await apiFetch(`/albums/${albumId}/media`, {
      method: "POST",
      body: JSON.stringify({ media_ids: mediaIds }),
    });
    onMediaChange();
  };

  if (spreads.length === 0) {
    return (
      <div className={`fixed inset-0 z-50 ${bgColor} flex flex-col`}>
        <BookToolbar
          albumName={albumName}
          albumId={albumId}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
          onBack={onBack}
          onAddPhotos={() => setShowAddModal(true)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">No photos yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Add photos to this album
            </button>
          </div>
        </div>
        {showAddModal && (
          <AddMediaModal
            albumId={albumId}
            existingMediaIds={orderedMedia.map((m) => m.id)}
            onAdd={handleAddMedia}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${bgColor} flex flex-col transition-colors duration-300`}>
      <BookToolbar
        albumName={albumName}
        albumId={albumId}
        isEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
        onBack={onBack}
        onAddPhotos={() => setShowAddModal(true)}
      />

      {/* Spread area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 pt-16 pb-2 min-h-0">
        <div
          className={`w-full flex-1 max-w-5xl min-h-0 transition-all duration-200 ${
            transitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
          }`}
        >
          <BookSpread
            spread={spreads[currentPage]}
            isEditMode={isEditMode}
            onReorder={handleReorder}
          />
        </div>
        <BookFooter />
      </div>

      <BookFilmstrip
        spreads={spreads}
        currentPage={currentPage}
        onPageChange={goToPage}
        isEditMode={isEditMode}
        bgColor={bgColor}
        onBgColorChange={setBgColor}
      />

      {showAddModal && (
        <AddMediaModal
          albumId={albumId}
          existingMediaIds={orderedMedia.map((m) => m.id)}
          onAdd={handleAddMedia}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
