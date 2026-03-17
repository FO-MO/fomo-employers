"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const Navbar = () => {
  const { user, employerProfile } = useAuth();
  const initials = employerProfile?.name
    ? employerProfile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : null;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          FOOMO
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#companies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            For Companies
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/employers/overview" className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials ?? "EP"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm text-foreground">{employerProfile?.name ?? user.email}</span>
            </Link>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-sm">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="text-sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
