"use client";

import { useEffect, useState, useCallback } from "react";
import { AlbumInvite, Collaborator } from "@/types";
import { apiFetch } from "@/lib/api";

interface ShareModalProps {
  albumId: string;
  albumName: string;
  initialVisibility: "private" | "public";
  onClose: () => void;
  onVisibilityChange: (v: "private" | "public") => void;
}

export default function ShareModal({
  albumId,
  albumName,
  initialVisibility,
  onClose,
  onVisibilityChange,
}: ShareModalProps) {
  const [visibility, setVisibility] = useState<"private" | "public">(initialVisibility);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invites, setInvites] = useState<AlbumInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "contributor">("viewer");
  const [inviting, setInviting] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${albumId}`
      : "";

  const load = useCallback(async () => {
    try {
      const [collabs, inv] = await Promise.all([
        apiFetch<Collaborator[]>(`/albums/${albumId}/collaborators`),
        apiFetch<AlbumInvite[]>(`/albums/${albumId}/invites`),
      ]);
      setCollaborators(collabs);
      setInvites(inv.filter((i) => i.status === "pending"));
    } catch {
      // non-fatal — lists stay empty
    }
  }, [albumId]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleVisibilityToggle = async (next: "private" | "public") => {
    if (next === visibility) return;
    setSavingVisibility(true);
    setError(null);
    try {
      await apiFetch(`/albums/${albumId}/share`, {
        method: "POST",
        body: JSON.stringify({ visibility: next }),
      });
      setVisibility(next);
      onVisibilityChange(next);
    } catch {
      setError("Failed to update visibility.");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select the text
    }
  };

  const handleCopyInviteLink = async (inv: AlbumInvite) => {
    try {
      await navigator.clipboard.writeText(inv.invite_link);
      setCopiedInviteId(inv.id);
      setTimeout(() => setCopiedInviteId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const inv = await apiFetch<AlbumInvite>(`/albums/${albumId}/invites`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      setInvites((prev) => [inv, ...prev]);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await apiFetch(`/albums/${albumId}/invites/${inviteId}/revoke`, {
        method: "POST",
      });
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch {
      setError("Failed to revoke invite.");
    }
  };

  const handleChangeRole = async (targetUserId: string, role: "viewer" | "contributor") => {
    try {
      const updated = await apiFetch<Collaborator>(
        `/albums/${albumId}/collaborators/${targetUserId}`,
        { method: "PATCH", body: JSON.stringify({ role }) }
      );
      setCollaborators((prev) =>
        prev.map((c) => (c.user_id === targetUserId ? updated : c))
      );
    } catch {
      setError("Failed to update role.");
    }
  };

  const handleRemoveCollaborator = async (targetUserId: string) => {
    try {
      await apiFetch(`/albums/${albumId}/collaborators/${targetUserId}`, {
        method: "DELETE",
      });
      setCollaborators((prev) => prev.filter((c) => c.user_id !== targetUserId));
    } catch {
      setError("Failed to remove collaborator.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Share album</h2>
            <p className="text-sm text-gray-500 mt-0.5">{albumName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Visibility toggle */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Who can view this album?</p>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => handleVisibilityToggle("private")}
                disabled={savingVisibility}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  visibility === "private"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Private
              </button>
              <button
                onClick={() => handleVisibilityToggle("public")}
                disabled={savingVisibility}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  visibility === "public"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Public
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {visibility === "public"
                ? "Anyone with the link can view this album without signing in."
                : "Only you and invited collaborators can view this album."}
            </p>
          </div>

          {/* Public link */}
          {visibility === "public" && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Public link</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-gray-50 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}

          {/* Invite section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Invite people</p>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "viewer" | "contributor")}
                className="px-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="viewer">Viewer</option>
                <option value="contributor">Contributor</option>
              </select>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {inviting ? "..." : "Invite"}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-1.5">
              Viewer can browse only. Contributor can also upload media.
            </p>
            <div className="mt-2 flex items-start gap-1.5 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>After inviting, copy the link below and send it via iMessage, WhatsApp, or any app.</span>
            </div>
          </div>

          {/* Pending invites */}
          {invites.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pending invites</p>
              <ul className="space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-gray-50 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 truncate flex-1">{inv.invited_email}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs capitalize shrink-0">
                        {inv.role}
                      </span>
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        title="Revoke invite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopyInviteLink(inv)}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-purple-200 bg-white text-purple-700 text-xs font-medium hover:bg-purple-50 transition-colors"
                    >
                      {copiedInviteId === inv.id ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600">Link copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy invite link — send via iMessage or WhatsApp</span>
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Collaborators</p>
              <ul className="space-y-2">
                {collaborators.map((c) => (
                  <li
                    key={c.user_id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm"
                  >
                    <span className="text-gray-700 text-sm truncate flex-1">
                      {c.email ?? c.user_id}
                    </span>
                    <select
                      value={c.role}
                      onChange={(e) =>
                        handleChangeRole(c.user_id, e.target.value as "viewer" | "contributor")
                      }
                      className="ml-2 px-2 py-0.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="contributor">Contributor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(c.user_id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove collaborator"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
