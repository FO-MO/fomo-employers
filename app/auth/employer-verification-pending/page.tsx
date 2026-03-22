"use client";

import { useRouter } from "next/navigation";
import { Clock3, LogOut, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function EmployerVerificationPendingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-card rounded-2xl border border-border/60 p-8 text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock3 className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Profile Submitted
          </h1>
          <p className="text-sm text-muted-foreground">
            Your employer profile is under review. Once it is verified, you will
            automatically get access to the dashboard.
          </p>
        </div>

        <div className="bg-muted/60 rounded-xl p-4 text-sm text-muted-foreground flex items-start gap-2 text-left">
          <MailCheck className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            We will notify{" "}
            <span className="text-foreground font-medium">
              {user?.email ?? "your email"}
            </span>{" "}
            after approval.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
          <Button
            className="flex-1"
            onClick={async () => {
              await signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
