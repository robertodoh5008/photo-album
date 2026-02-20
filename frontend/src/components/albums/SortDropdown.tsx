"use client";

import Popover from "@/components/ui/Popover";
import { SortOption } from "@/types";

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  return (
    <Popover
      trigger={
        <button className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      }
    >
      <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Sorting
      </p>
      <button
        onClick={() => onSortChange("name")}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        {sortBy === "name" && (
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        <span className={sortBy !== "name" ? "ml-6" : ""}>By name</span>
      </button>
      <button
        onClick={() => onSortChange("date")}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        {sortBy === "date" && (
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        <span className={sortBy !== "date" ? "ml-6" : ""}>By date</span>
      </button>
    </Popover>
  );
}
