"use client";

import { useState } from "react";
import { MediaItem } from "@/types";
import { MediaCard } from "./MediaCard";
import { VideoPlayer } from "./VideoPlayer";
import { Modal } from "@/components/ui/Modal";

interface MediaGridProps {
  items: MediaItem[];
  onDelete: (item: MediaItem) => void;
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

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
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onSelect={setSelectedItem}
            onDelete={onDelete}
          />
        ))}
      </div>

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem?.type === "video" ? (
          <VideoPlayer src={selectedItem.view_url} />
        ) : selectedItem ? (
          <img
            src={selectedItem.view_url}
            alt={selectedItem.filename || "Photo"}
            className="w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : null}
      </Modal>
    </>
  );
}
