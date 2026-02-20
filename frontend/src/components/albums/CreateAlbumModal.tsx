"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface CreateAlbumModalProps {
  folderId?: string | null;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAlbumModal({ folderId, onClose, onCreated }: CreateAlbumModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (folderId) body.folder_id = folderId;
      await apiFetch("/albums", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New album</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Album name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
