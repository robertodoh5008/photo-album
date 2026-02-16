"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800">
      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-5%] w-80 h-80 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Your Family Memories,{" "}
            <span className="text-purple-200">Beautifully Preserved</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-purple-100 leading-relaxed max-w-xl">
            A private, beautiful space for your family to upload, store, and
            relive your most cherished photos and videos together.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg">
                Start Sharing Memories
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
