import { HeroSection } from "@/components/landing/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Features section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything your family needs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Photos & Videos
            </h3>
            <p className="text-gray-500">
              Easily upload and organize your family&apos;s precious moments in one secure place.
            </p>
          </div>
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Private & Secure
            </h3>
            <p className="text-gray-500">
              Your memories are protected with authentication and encrypted storage.
            </p>
          </div>
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Beautiful Gallery
            </h3>
            <p className="text-gray-500">
              View your media in a clean, responsive grid with video playback support.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
