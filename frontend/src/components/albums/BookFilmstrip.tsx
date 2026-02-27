"use client";

import { useRef } from "react";
import { Spread } from "@/types";

const BG_COLORS = [
  { name: "Dark", value: "bg-gray-900" },
  { name: "White", value: "bg-white" },
  { name: "Cream", value: "bg-stone-100" },
  { name: "Warm", value: "bg-amber-50" },
  { name: "Rose", value: "bg-rose-50" },
  { name: "Sky", value: "bg-sky-50" },
  { name: "Mint", value: "bg-emerald-50" },
  { name: "Lavender", value: "bg-purple-50" },
];

interface BookFilmstripProps {
  spreads: Spread[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isEditMode: boolean;
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

export default function BookFilmstrip({
  spreads,
  currentPage,
  onPageChange,
  isEditMode,
  bgColor,
  onBgColorChange,
}: BookFilmstripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -240 : 240;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 shrink-0">
      {/* Page indicator */}
      <div className="flex justify-center py-1.5">
        <span className="text-gray-400 text-xs">
          Page {currentPage + 1} of {spreads.length}
        </span>
      </div>

      <div className="flex items-center px-2 sm:px-4 pb-2">
        {/* Left arrow */}
        <button
          onClick={() => scrollBy("left")}
          className="text-gray-400 hover:text-white transition-colors shrink-0 p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Thumbnails */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto flex-1 mx-1"
          style={{ scrollbarWidth: "none" }}
        >
          {spreads.map((spread, idx) => (
            <button
              key={idx}
              onClick={() => onPageChange(idx)}
              className={`shrink-0 rounded overflow-hidden transition-all ${
                idx === currentPage
                  ? "ring-2 ring-purple-500 ring-offset-1 ring-offset-gray-800"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-28 h-16 sm:w-36 sm:h-20 flex gap-px bg-gray-600">
                {spread.media.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.view_url}
                    alt=""
                    className="h-full flex-1 object-cover min-w-0"
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollBy("right")}
          className="text-gray-400 hover:text-white transition-colors shrink-0 p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Background color picker — edit mode only */}
      {isEditMode && (
        <div className="flex items-center justify-center gap-3 pb-3 px-4">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Background</span>
          <div className="flex gap-1.5">
            {BG_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onBgColorChange(color.value)}
                title={color.name}
                className={`w-5 h-5 rounded-full ${color.value} border-2 transition-all ${
                  bgColor === color.value
                    ? "border-purple-500 scale-110"
                    : "border-gray-500 hover:border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
