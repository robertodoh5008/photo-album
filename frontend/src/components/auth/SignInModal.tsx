"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoginForm } from "./LoginForm";

type Props = {
	onClose?: () => void;
};

export default function SignInModal({ onClose }: Props) {
	const [showEmail, setShowEmail] = useState(false);
	const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);

	useEffect(() => {
		// Save previous focus and trap focus inside modal
		previouslyFocused.current = document.activeElement as HTMLElement | null;
		const container = containerRef.current;
		if (!container) return;

		const focusable = Array.from(
			container.querySelectorAll<HTMLElement>(
				'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute("disabled"));

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (first) first.focus();

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose && onClose();
				return;
			}
			if (e.key === "Tab") {
				if (focusable.length === 0) {
					e.preventDefault();
					return;
				}
				const active = document.activeElement as HTMLElement | null;
				if (e.shiftKey) {
					if (active === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (active === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			if (previouslyFocused.current) previouslyFocused.current.focus();
		};
	}, [onClose]);

	const signInWithProvider = async (provider: "google" | "facebook" | "apple") => {
		try {
			setLoadingProvider(provider);
			await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});
		} catch (err) {
			console.error("OAuth sign-in error", err);
		} finally {
			setLoadingProvider(null);
		}
	};

	return (
		<div className="fixed inset-0 z-60 flex items-start justify-center pt-24 sm:pt-32 px-4">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => onClose && onClose()}
				aria-hidden
			/>

			<div ref={containerRef} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" style={{ margin: '0 auto' }}>
				<button
					aria-label="Close"
					onClick={() => onClose && onClose()}
					className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 rounded-md p-1"
				>
					<span aria-hidden>×</span>
				</button>
				<div className="flex flex-col items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
						<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							<path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>

					<h2 className="text-xl font-semibold text-gray-800">Relive the best moments</h2>
					<p className="text-sm text-gray-500">Welcome to MyAlbum</p>
				</div>

				<div className="mt-6 space-y-3">
					<button
						onClick={() => signInWithProvider("google")}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 hover:bg-gray-50"
					>
						<img src="/images/google.svg" alt="Google" className="h-5 w-5" />
						<span className="flex-1 text-gray-700">Continue with Google</span>
						{loadingProvider === "google" && <span className="text-sm text-gray-500">...</span>}
					</button>

					<button
						onClick={() => signInWithProvider("facebook")}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 hover:bg-gray-50"
					>
						<img src="/images/facebook.svg" alt="Facebook" className="h-5 w-5" />
						<span className="flex-1 text-gray-700">Continue with Facebook</span>
						{loadingProvider === "facebook" && <span className="text-sm text-gray-500">...</span>}
					</button>

					<button
						onClick={() => signInWithProvider("apple")}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 hover:bg-gray-50"
					>
						<img src="/images/apple.svg" alt="Apple" className="h-5 w-5" />
						<span className="flex-1 text-gray-700">Continue with Apple</span>
						{loadingProvider === "apple" && <span className="text-sm text-gray-500">...</span>}
					</button>

					<button
						onClick={() => setShowEmail(true)}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 hover:bg-gray-50"
					>
						<svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 8.5L12 13L21 8.5" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							<rect x="3" y="5" width="18" height="14" rx="2" stroke="#4b5563" strokeWidth="1.5" />
						</svg>
						<span className="flex-1 text-gray-700">Continue with email</span>
					</button>
				</div>

				{showEmail && (
					<div className="mt-6">
						<LoginForm />
					</div>
				)}

				<div className="mt-6 text-center text-sm text-gray-500">
					<p>
						No account yet? <a href="/login?tab=register" className="text-purple-600 font-medium">Register for free</a>
					</p>
					<p className="mt-2 text-xs">Terms and Conditions</p>
				</div>
			</div>
		</div>
	);
}
