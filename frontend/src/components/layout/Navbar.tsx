"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-purple-700">
          Family Album
        </Link>

        <div className="flex items-center gap-4">
          {!loading && user && (
            <>
              <Link
                href="/gallery"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/upload"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
              >
                Upload
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
          {!loading && !user && (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
