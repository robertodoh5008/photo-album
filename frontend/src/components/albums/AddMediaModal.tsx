"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/types";
import { apiFetch } from "@/lib/api";

interface AddMediaModalProps {
  albumId: string;
  existingMediaIds: string[];
  onAdd: (mediaIds: string[]) => Promise<void>;
  onClose: () => void;
}

export default function AddMediaModal({
  albumId,
  existingMediaIds,
  onAdd,
  onClose,
}: AddMediaModalProps) {
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await apiFetch<MediaItem[]>("/media");
        // Filter out media already in this album
        const available = data.filter((m) => !existingMediaIds.includes(m.id));
        setAllMedia(available);
      } catch {
        setAllMedia([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [existingMediaIds]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === allMedia.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allMedia.map((m) => m.id)));
    }
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    try {
      await onAdd(Array.from(selected));
      onClose();
    } catch {
      alert("Failed to add media to album.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add photos to album</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            </div>
          )}

          {!loading && allMedia.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No available media to add.</p>
              <p className="text-gray-400 text-sm mt-1">Upload photos first from the Upload page.</p>
            </div>
          )}

          {!loading && allMedia.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{allMedia.length} available</p>
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selected.size === allMedia.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allMedia.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selected.has(item.id)
                        ? "border-purple-600 ring-2 ring-purple-300"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.view_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                    ) : (
                      <img
                        src={item.view_url}
                        alt={item.filename || ""}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selected.has(item.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || adding}
            className="px-5 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? "Adding..." : `Add ${selected.size > 0 ? selected.size : ""} photo${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
