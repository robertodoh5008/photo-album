"use client";

import { Album, Folder } from "@/types";
import AlbumTile from "./AlbumTile";
import FolderTile from "./FolderTile";

interface OverviewGridProps {
  folders: Folder[];
  albums: Album[];
  searchQuery: string;
  onFolderClick: (folderId: string) => void;
  onDeleteAlbum?: (albumId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
}

export default function OverviewGrid({
  folders,
  albums,
  searchQuery,
  onFolderClick,
  onDeleteAlbum,
  onDeleteFolder,
}: OverviewGridProps) {
  const q = searchQuery.toLowerCase();
  const filteredFolders = q
    ? folders.filter((f) => f.name.toLowerCase().includes(q))
    : folders;
  const filteredAlbums = q
    ? albums.filter((a) => a.name.toLowerCase().includes(q))
    : albums;

  if (filteredFolders.length === 0 && filteredAlbums.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No albums or folders yet</p>
        <p className="mt-1 text-sm">Click &quot;+ New&quot; to create one</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredFolders.map((folder) => (
        <FolderTile
          key={folder.id}
          folder={folder}
          onClick={onFolderClick}
          onDelete={onDeleteFolder}
        />
      ))}
      {filteredAlbums.map((album) => (
        <AlbumTile
          key={album.id}
          album={album}
          onDelete={onDeleteAlbum}
        />
      ))}
    </div>
  );
}
