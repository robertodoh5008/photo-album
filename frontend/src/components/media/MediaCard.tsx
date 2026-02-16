"use client";

import { MediaItem } from "@/types";

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

export function MediaCard({ item, onSelect, onDelete }: MediaCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer">
      {item.type === "image" ? (
        <img
          src={item.view_url}
          alt={item.filename || "Photo"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => onSelect(item)}
        />
      ) : (
        <div className="relative w-full h-full" onClick={() => onSelect(item)}>
          <video
            src={item.view_url}
            preload="metadata"
            className="w-full h-full object-cover"
            muted
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-purple-700 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Type badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        {item.type === "image" ? "Photo" : "Video"}
      </div>
    </div>
  );
}
