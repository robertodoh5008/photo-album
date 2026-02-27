"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FamilyMember } from "@/types";
import { apiFetch } from "@/lib/api";

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "contributor">("viewer");
  const [inviting, setInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<FamilyMember[]>("/family");
      setMembers(data);
    } catch {
      setError("Failed to load family members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const member = await apiFetch<FamilyMember>("/family/invite", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      setMembers((prev) => [member, ...prev]);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async (member: FamilyMember) => {
    if (!member.invite_link) return;
    try {
      await navigator.clipboard.writeText(member.invite_link);
      setCopiedId(member.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleChangeRole = async (id: string, role: "viewer" | "contributor") => {
    try {
      const updated = await apiFetch<FamilyMember>(`/family/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch {
      setError("Failed to update role.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiFetch(`/family/${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("Failed to remove member.");
    }
  };

  const pending = members.filter((m) => m.status === "pending");
  const active = members.filter((m) => m.status === "accepted");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/gallery"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Family members get access to all your current and future albums automatically.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-7">
          {/* Invite form */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Add a family member</p>
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
                {inviting ? "..." : "Add"}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-1.5">
              Viewer can browse only. Contributor can also upload media.
            </p>
            <div className="mt-2 flex items-start gap-1.5 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Copy the invite link below and send it via iMessage, WhatsApp, or any app.</span>
            </div>
          </div>

          {/* Pending invites */}
          {pending.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pending invites</p>
              <ul className="space-y-2">
                {pending.map((m) => (
                  <li key={m.id} className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate flex-1">{m.invited_email}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs capitalize shrink-0">
                        {m.role}
                      </span>
                      <button
                        onClick={() => handleRemove(m.id)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        title="Revoke invite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopyLink(m)}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-purple-200 bg-white text-purple-700 text-xs font-medium hover:bg-purple-50 transition-colors"
                    >
                      {copiedId === m.id ? (
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

          {/* Active members */}
          {active.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Active members</p>
              <ul className="space-y-2">
                {active.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm"
                  >
                    <span className="text-gray-700 truncate flex-1">
                      {m.email ?? m.invited_email}
                    </span>
                    <select
                      value={m.role}
                      onChange={(e) => handleChangeRole(m.id, e.target.value as "viewer" | "contributor")}
                      className="ml-2 px-2 py-0.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="contributor">Contributor</option>
                    </select>
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove member"
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

          {!loading && members.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No family members yet. Add someone above to get started.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
