"use client";

import Popover from "@/components/ui/Popover";

export default function NotificationsPopover() {
  return (
    <Popover
      align="right"
      trigger={
        <button className="relative p-2 text-gray-500 hover:text-purple-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>
      }
    >
      <div className="px-4 py-3 min-w-[240px]">
        <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
        <p className="text-sm text-gray-500 mt-0.5">You are up-to-date</p>
      </div>
      <div className="border-t border-gray-100 px-4 py-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Requests</p>
        <button className="w-full text-left text-sm text-gray-700 py-1.5 hover:text-purple-600">
          Access...
        </button>
        <button className="w-full text-left text-sm text-gray-700 py-1.5 hover:text-purple-600">
          Contributions...
        </button>
      </div>
    </Popover>
  );
}
