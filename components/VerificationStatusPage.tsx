"use client";

import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

interface VerificationStatusPageProps {
  status: number; // 0 = pending, 1 = verified, -1 = rejected
}

export default function VerificationStatusPage({
  status,
}: VerificationStatusPageProps) {
  if (status === 1) {
    // User is verified, should not see this page
    return null;
  }

  const isPending = status === 0;
  const isRejected = status === -1;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            {isPending ? (
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isPending ? "Verification Pending" : "Verification Rejected"}
          </h1>

          {/* Description */}
          <div className="space-y-4 mb-8">
            {isPending ? (
              <>
                <p className="text-gray-600 text-lg">
                  Your account is under review. Our team is verifying your
                  profile information.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-amber-900 font-semibold mb-2">
                    ⏱️ Expected Timeline:
                  </p>
                  <p className="text-sm text-amber-800">
                    Verification typically takes 3-4 business days. We&apos;ll
                    notify you once your account is verified.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  In the meantime, you can explore the main page and prepare
                  additional information if needed.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-lg">
                  Unfortunately, your account verification was not approved.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-red-900 font-semibold mb-2">
                    ❌ What to do next:
                  </p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Check that all your information is accurate</li>
                    <li>• Ensure your profile is complete</li>
                    <li>• Try verifying again with correct details</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">
                  If you believe this is an error, please contact our support
                  team.
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {isPending && (
              <p className="text-xs text-gray-500">
                You can access the main page while your verification is pending.
              </p>
            )}
            <Link
              href="/"
              className="w-full px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition-colors"
            >
              Go to Home
            </Link>
            {isRejected && (
              <Link
                href="/auth/setup-profile"
                className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-teal-700 border-2 border-teal-700 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </Link>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {isPending
                ? "Your verification status will be updated automatically."
                : "Contact support@foomo.in if you have questions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
