"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Album, MediaItem } from "@/types";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useAuth } from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [album, setAlbum] = useState<Album | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [albumData, mediaData] = await Promise.all([
          publicFetch<Album>(`/public/albums/${id}`),
          publicFetch<MediaItem[]>(`/public/albums/${id}/media`),
        ]);
        setAlbum(albumData);
        setMedia(mediaData);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Album not available</h1>
        <p className="text-gray-500 mb-6">
          This album is either private or doesn&apos;t exist. Ask the owner for an invite link.
        </p>
        {user ? (
          <Link href="/gallery" className="text-purple-600 font-medium hover:underline">
            Go to your gallery
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-purple-600 font-medium mb-1">Shared album</p>
          <h1 className="text-3xl font-bold text-gray-900">{album?.name}</h1>
          {album?.description && (
            <p className="text-gray-500 mt-1">{album.description}</p>
          )}
        </div>
        {user ? (
          <Link
            href={`/albums/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-purple-200 text-purple-600 text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            Open in your library
          </Link>
        ) : (
          <Link
            href={`/login?redirectTo=/albums/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Sign in to collaborate
          </Link>
        )}
      </div>

      {media.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No photos in this album yet.</div>
      ) : (
        <MediaGrid items={media} onDelete={() => {}} />
      )}
    </div>
  );
}
