"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import SignInModal from "@/components/auth/SignInModal";

export function HeroSection() {
  const [showModal, setShowModal] = useState(false);
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sunset-sky.png')" }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Your Family Memories,{" "}
            <span className="text-amber-200">Beautifully Preserved</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed max-w-xl">
            A private, beautiful space for your family to upload, store, and
            relive your most cherished photos and videos together.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-purple-700 hover:bg-purple-50 shadow-lg px-8 py-4 text-lg"
            >
              Start Sharing Memories
            </button>
          </div>
          {showModal && <SignInModal onClose={() => setShowModal(false)} />}
        </div>
      </div>
    </section>
  );
}
