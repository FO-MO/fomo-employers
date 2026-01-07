"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAuthToken } from "@/lib/strapi/auth";
import { getStudentProfile_2 } from "@/lib/strapi/profile";

export interface VerificationState {
  isLoading: boolean;
  verificationStatus: number | null; // 0 = pending, 1 = verified, -1 = rejected
  isVerified: boolean;
}

/**
 * Hook to check if user is verified
 * Returns verification status and whether user is verified
 */
export function useVerificationCheck(): VerificationState {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<number | null>(
    null
  );

  useEffect(() => {
    const checkVerification = async () => {
      // Don't check on auth pages
      const isAuthPage = pathname?.startsWith("/auth");
      if (isAuthPage) {
        setIsLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Get user ID from cookies
      let studentId: string | null = null;
      try {
        const { getUserCookie } = await import("@/lib/cookies");
        const user = getUserCookie();
        if (user) {
          studentId = user?.documentId || null;
        }
      } catch (err) {
        console.error("Failed to get user data:", err);
      }

      if (!studentId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch student profile to get verification status
        const profile = await getStudentProfile_2(studentId, token);
        const status = profile?.verification ?? 0; // Default to pending if not set

        setVerificationStatus(status);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to check verification status:", err);
        setVerificationStatus(0); // Default to pending on error
        setIsLoading(false);
      }
    };

    checkVerification();
  }, [pathname]);

  return {
    isLoading,
    verificationStatus,
    isVerified: verificationStatus === 1,
  };
}
