"use client";

import { Folder } from "@/types";

interface FolderTileProps {
  folder: Folder;
  onClick: (folderId: string) => void;
}

export default function FolderTile({ folder, onClick }: FolderTileProps) {
  return (
    <button
      onClick={() => onClick(folder.id)}
      className="group block w-full text-left"
    >
      <div className="aspect-[4/3] rounded-xl border border-purple-100 bg-purple-50 flex items-center justify-center transition-colors group-hover:bg-purple-100">
        <svg
          className="w-10 h-10 text-purple-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-purple-400 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
        </svg>
        <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
      </div>
    </button>
  );
}
