"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserCookie, getAuthTokenCookie } from "@/lib/cookies";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const userObj = getUserCookie();
        const token = getAuthTokenCookie();

        if (userObj && token) {
          // User is logged in, redirect to employer dashboard
          router.replace("/employers/overview");
        } else {
          // User is not logged in, redirect to login page
          router.replace("/auth/login");
        }
      } catch (e) {
        console.warn("Failed to check auth status", e);
        // On error, redirect to login
        router.replace("/auth/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show a loading state while redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
}
