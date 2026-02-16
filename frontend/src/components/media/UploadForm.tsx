"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setFiles((prev) => [...prev, ...valid]);
    setError("");
    setSuccess(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        const mediaType = file.type.startsWith("image/") ? "image" : "video";

        // Step 1: Get presigned upload URL from backend
        const presign = await apiFetch<{ upload_url: string; s3_key: string }>(
          "/uploads/presign",
          {
            method: "POST",
            body: JSON.stringify({
              filename: file.name,
              content_type: file.type,
              type: mediaType,
            }),
          }
        );

        // Step 2: Upload file directly to S3
        const s3Response = await fetch(presign.upload_url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!s3Response.ok) {
          throw new Error("Failed to upload file to storage");
        }

        // Step 3: Save metadata to backend
        await apiFetch("/media", {
          method: "POST",
          body: JSON.stringify({
            s3_key: presign.s3_key,
            type: mediaType,
            filename: file.name,
            size_bytes: file.size,
            content_type: file.type,
          }),
        });
      }
      setSuccess(true);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-purple-500 bg-purple-50"
            : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
        }`}
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-lg font-medium text-gray-700 mb-1">
          Drop your photos & videos here
        </p>
        <p className="text-sm text-gray-500">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm">
                  {file.type.startsWith("image/") ? "🖼️" : "🎬"}
                </span>
                <span className="text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <div className="mt-4 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>Upload complete!</span>
          <button
            onClick={() => router.push("/gallery")}
            className="text-purple-600 font-medium hover:underline"
          >
            View Gallery
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading
              ? "Uploading..."
              : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
