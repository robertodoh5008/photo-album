"use client";

import Link from "next/link";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

interface BookToolbarProps {
  albumName: string;
  albumId: string;
  isEditMode: boolean;
  onEditModeChange: (value: boolean) => void;
  onBack: () => void;
  onAddPhotos: () => void;
}

export default function BookToolbar({
  albumName,
  albumId,
  isEditMode,
  onEditModeChange,
  onBack,
  onAddPhotos,
}: BookToolbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md h-14 flex items-center px-4 sm:px-6">
      {/* Left: Back */}
      <button
        onClick={onBack}
        className="text-gray-300 hover:text-white transition-colors shrink-0 mr-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Center: Album name */}
      <div className="flex-1 min-w-0">
        <h1 className="text-white font-semibold text-sm sm:text-base truncate">
          {albumName}
        </h1>
      </div>

      {/* Right: Edit mode controls */}
      <div className="flex items-center gap-3 shrink-0">
        {isEditMode && (
          <>
            <button
              onClick={onAddPhotos}
              className="flex items-center gap-1.5 text-sm text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Add Photos</span>
            </button>
            <Link
              href={`/upload?albumId=${albumId}`}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="hidden sm:inline">Upload</span>
            </Link>
          </>
        )}
        <div className="text-white">
          <ToggleSwitch
            checked={isEditMode}
            onChange={onEditModeChange}
            label="Edit"
          />
        </div>
      </div>
    </div>
  );
}
