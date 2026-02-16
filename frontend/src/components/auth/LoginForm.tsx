"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/gallery");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        {isSignUp ? "Create Account" : "Welcome Back"}
      </h1>
      <p className="text-center text-gray-500 mb-8">
        {isSignUp
          ? "Sign up to start sharing memories"
          : "Sign in to your Family Album"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setMessage("");
          }}
          className="text-purple-600 font-medium hover:underline"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
