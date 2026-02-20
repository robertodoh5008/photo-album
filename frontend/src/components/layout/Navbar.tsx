"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SignInModal from "@/components/auth/SignInModal";
import NotificationsPopover from "@/components/layout/NotificationsPopover";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={user ? "/gallery" : "/"} className="text-xl font-bold text-purple-700">
          Family Album
        </Link>

        <div className="flex items-center gap-3">
          {!loading && user && (
            <>
              <NotificationsPopover />
              <ProfileDropdown />
            </>
          )}
          {!loading && !user && (
            <>
              <SignInButton />
              <Link
                href="/login?tab=register"
                className="px-5 py-2 rounded-full border-2 border-purple-600 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function SignInButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
      >
        Sign In
      </button>
      {open && <SignInModal onClose={() => setOpen(false)} />}
    </>
  );
}
