"use client";

import { MediaFilter } from "@/types";

interface FilterBarProps {
  activeFilter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const filters: { label: string; value: MediaFilter }[] = [
  { label: "All", value: "all" },
  { label: "Photos", value: "image" },
  { label: "Videos", value: "video" },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex gap-2">
      {filters.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === value
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
