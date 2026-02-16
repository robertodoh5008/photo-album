"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UploadForm } from "@/components/media/UploadForm";

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Upload Memories
        </h1>
        <UploadForm />
      </div>
    </ProtectedRoute>
  );
}
