"use client";

import { SortOption } from "@/types";
import NewDropdown from "./NewDropdown";
import SortDropdown from "./SortDropdown";
import SearchBar from "./SearchBar";

interface AlbumOverviewToolbarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewAlbum: () => void;
  onNewFolder: () => void;
}

export default function AlbumOverviewToolbar({
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  onNewAlbum,
  onNewFolder,
}: AlbumOverviewToolbarProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <NewDropdown onNewAlbum={onNewAlbum} onNewFolder={onNewFolder} />
      <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
      <div className="ml-auto w-56">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
    </div>
  );
}
