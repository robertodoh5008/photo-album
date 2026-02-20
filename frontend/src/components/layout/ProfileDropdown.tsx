"use client";

import Popover from "@/components/ui/Popover";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const initials = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Popover
      align="right"
      trigger={
        <button className="w-9 h-9 rounded-full bg-purple-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-purple-700 transition-colors">
          {initials}
        </button>
      }
    >
      <div className="px-4 py-3 min-w-[220px]">
        <p className="text-sm font-semibold text-gray-900">Family Album</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Photos and videos stored securely in your private album.
        </p>
      </div>
      <div className="border-t border-gray-100">
        <button
          onClick={() => router.push("/gallery")}
          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Gallery
        </button>
        <button
          onClick={() => router.push("/upload")}
          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Upload
        </button>
      </div>
      <div className="border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </Popover>
  );
}
