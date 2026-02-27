"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "@/types";
import { MediaCard } from "./MediaCard";
import { VideoPlayer } from "./VideoPlayer";
import { Modal } from "@/components/ui/Modal";

interface MediaGridProps {
  items: MediaItem[];
  onDelete: (item: MediaItem) => void;
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i < items.length - 1 ? i + 1 : i));
  }, [items.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedIndex, handlePrev, handleNext]);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No media yet
        </h3>
        <p className="text-gray-500">
          Upload your first memory to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <MediaCard
            key={item.id}
            item={item}
            onSelect={() => setSelectedIndex(index)}
            onDelete={onDelete}
          />
        ))}
      </div>

      <Modal
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
      >
        {/* Counter */}
        {selectedIndex !== null && (
          <div className="absolute -top-10 left-0 text-white/70 text-sm">
            {selectedIndex + 1} / {items.length}
          </div>
        )}

        {/* Prev button */}
        {selectedIndex !== null && selectedIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Media content */}
        {selectedItem?.type === "video" ? (
          <VideoPlayer src={selectedItem.view_url} />
        ) : selectedItem ? (
          <img
            src={selectedItem.view_url}
            alt={selectedItem.filename || "Photo"}
            className="w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : null}

        {/* Next button */}
        {selectedIndex !== null && selectedIndex < items.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </Modal>
    </>
  );
}
