"use client";

interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <video
      src={src}
      controls
      autoPlay
      className="w-full max-h-[80vh] rounded-lg bg-black"
    />
  );
}
