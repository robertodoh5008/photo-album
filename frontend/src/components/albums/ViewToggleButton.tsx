"use client";

import { ViewMode } from "@/types";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

interface ViewToggleButtonProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggleButton({ viewMode, onChange }: ViewToggleButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 bg-white rounded-full shadow-lg px-4 py-2.5 flex items-center gap-2 border border-gray-200">
      <ToggleSwitch
        checked={viewMode === "book"}
        onChange={(checked) => onChange(checked ? "book" : "grid")}
        label="Book view"
      />
    </div>
  );
}
