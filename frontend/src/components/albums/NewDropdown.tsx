"use client";

import Popover from "@/components/ui/Popover";

interface NewDropdownProps {
  onNewAlbum: () => void;
  onNewFolder: () => void;
}

export default function NewDropdown({ onNewAlbum, onNewFolder }: NewDropdownProps) {
  return (
    <Popover
      trigger={
        <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
      }
    >
      <button
        onClick={onNewAlbum}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
      >
        New album
      </button>
      <button
        onClick={onNewFolder}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
      >
        New folder
      </button>
    </Popover>
  );
}
