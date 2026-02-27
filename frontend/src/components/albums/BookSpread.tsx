"use client";

import { useState, useRef } from "react";
import { Spread, MediaItem } from "@/types";
import { Modal } from "@/components/ui/Modal";

interface BookSpreadProps {
  spread: Spread;
  isEditMode: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function BookSpread({ spread, isEditMode, onReorder }: BookSpreadProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      onReorder?.(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const renderImage = (item: MediaItem, globalIndex: number) => (
    <div
      key={item.id}
      className={`overflow-hidden relative group ${isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      draggable={isEditMode}
      onDragStart={() => handleDragStart(globalIndex)}
      onDragOver={(e) => handleDragOver(e, globalIndex)}
      onDrop={handleDrop}
      onClick={() => !isEditMode && setSelectedMedia(item)}
    >
      <img
        src={item.view_url}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
      {isEditMode && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`bg-white rounded-lg overflow-hidden w-full h-full shadow-2xl ${
          isEditMode ? "ring-2 ring-dashed ring-purple-400" : ""
        }`}
      >
        {spread.layout === "hero-two" && spread.media.length >= 3 && (
          <div className="grid grid-cols-2 gap-[2px] h-full bg-gray-200">
            {renderImage(spread.media[0], 0)}
            <div className="grid grid-rows-2 gap-[2px]">
              {renderImage(spread.media[1], 1)}
              {renderImage(spread.media[2], 2)}
            </div>
          </div>
        )}

        {spread.layout === "two-equal" && (
          <div className="grid grid-cols-2 gap-[2px] h-full bg-gray-200">
            {spread.media.slice(0, 2).map((item, i) => renderImage(item, i))}
          </div>
        )}

        {spread.layout === "hero-one" && (
          <div
            className={`grid gap-[2px] h-full bg-gray-200 ${
              spread.media.length > 1 ? "grid-cols-[3fr_2fr]" : "grid-cols-1"
            }`}
          >
            {renderImage(spread.media[0], 0)}
            {spread.media[1] && renderImage(spread.media[1], 1)}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedMedia} onClose={() => setSelectedMedia(null)}>
        {selectedMedia && (
          selectedMedia.type === "video" ? (
            <video
              src={selectedMedia.view_url}
              controls
              autoPlay
              className="w-full max-h-[80vh] rounded-lg"
            />
          ) : (
            <img
              src={selectedMedia.view_url}
              alt={selectedMedia.filename || ""}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          )
        )}
      </Modal>
    </>
  );
}
