"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FamilyInvitePreview } from "@/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const ROLE_LABELS: Record<string, string> = {
  viewer: "Viewer — you can browse all albums",
  contributor: "Contributor — you can browse and upload to all albums",
};

export default function FamilyInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [preview, setPreview] = useState<FamilyInvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await publicFetch<FamilyInvitePreview>(`/public/family-invites/${token}`);
        setPreview(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      await apiFetch(`/family/invites/${token}/accept`, { method: "POST" });
      setAccepted(true);
      setTimeout(() => router.push("/gallery"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite.");
    } finally {
      setAccepting(false);
    }
  };

  if (loadingPreview || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite not found</h1>
        <p className="text-gray-500 mb-6">This invite link is invalid or was revoked.</p>
        <Link href="/" className="text-purple-600 font-medium hover:underline">Go home</Link>
      </div>
    );
  }

  if (preview?.status === "revoked") {
    return (
      <StatusCard emoji="🚫" title="Invite revoked" message="This family invite has been revoked." />
    );
  }

  if (preview?.status === "accepted" && !accepted) {
    return (
      <StatusCard
        emoji="✓"
        title="Already accepted"
        message="You've already accepted this invite."
        linkHref="/gallery"
        linkLabel="Go to Gallery"
      />
    );
  }

  if (accepted) {
    return (
      <StatusCard
        emoji="🎉"
        title="Welcome to the family!"
        message="All albums are now shared with you. Redirecting to Gallery…"
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>

        <p className="text-sm text-purple-600 font-medium mb-1">Family invite</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{preview?.owner_name}</h1>
        <p className="text-sm text-gray-500 mb-1">has invited you to their family album</p>
        <p className="text-sm text-gray-500 mb-6">
          {preview?.role ? ROLE_LABELS[preview.role] ?? preview.role : ""}
        </p>

        {user ? (
          <>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {accepting ? "Accepting…" : "Accept invite"}
            </button>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <p className="mt-4 text-xs text-gray-400">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Sign in to accept this invite.</p>
            <Link
              href={`/login?redirectTo=/family-invite/${token}`}
              className="block w-full py-3 rounded-full bg-purple-600 text-white font-semibold text-center hover:bg-purple-700 transition-colors"
            >
              Sign in to accept
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  emoji, title, message, linkHref, linkLabel,
}: {
  emoji: string; title: string; message: string; linkHref?: string; linkLabel?: string;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">{message}</p>
      {linkHref && linkLabel && (
        <Link href={linkHref} className="text-purple-600 font-medium hover:underline">{linkLabel}</Link>
      )}
    </div>
  );
}
