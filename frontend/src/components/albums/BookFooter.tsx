"use client";

import { useAuth } from "@/hooks/useAuth";

export default function BookFooter() {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0]?.toUpperCase() || "FAMILY";

  return (
    <div className="text-center py-2 shrink-0">
      <p className="text-gray-500 text-[10px] tracking-wide">Made by</p>
      <p className="text-gray-300 text-xs font-semibold tracking-wider">
        {name}
      </p>
    </div>
  );
}
