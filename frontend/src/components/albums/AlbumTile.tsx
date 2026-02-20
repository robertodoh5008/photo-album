"use client";

import Link from "next/link";
import { Album } from "@/types";

interface AlbumTileProps {
  album: Album;
}

export default function AlbumTile({ album }: AlbumTileProps) {
  return (
    <Link href={`/albums/${album.id}`} className="group block">
      <div className="aspect-[4/3] rounded-xl overflow-hidden border border-purple-100 bg-purple-50">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-purple-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-900 truncate">{album.name}</p>
    </Link>
  );
}
