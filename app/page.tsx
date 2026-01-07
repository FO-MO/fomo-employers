"use client";

export const dynamic = "force-dynamic";

import TopBar from "@/components/bars/topBar";
import Hero1 from "@/components/hero/Hero1";
import Hero2 from "@/components/hero/Hero2";
import Hero3 from "@/components/hero/Hero3";
import Hero4 from "@/components/hero/Hero4";
import Hero5 from "@/components/hero/Hero5";
import Footer from "@/components/bars/footer";
import { useEffect, useState } from "react";
import { getUserCookie } from "@/lib/cookies";

// Safely access user data from cookies
interface User {
  username: string;
  abbreviation: string;
  userType: "student" | "college" | "employer";
  loggedIn: boolean;
}

function useParsedUser() {
  const [parsedUser, setParsedUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      // Use cookies instead of localStorage
      const userObj = getUserCookie();
      if (userObj) {
        const username = userObj.username || "User";
        setParsedUser({
          ...userObj,
          username,
          loggedIn: true,
          userType: "student",
          abbreviation: username.substring(0, 2).toUpperCase(),
        });
      }
    } catch (e) {
      console.warn("Failed to read user from cookies", e);
    }
  }, []);

  return parsedUser;
}

export default function Home() {
  const parsedUser = useParsedUser();
  return (
    <>
      <TopBar theme="home" user={parsedUser} />
      <Hero1 />
      <Hero2 />
      <Hero3 />
      <Hero4 />
      <Hero5 />
      <Footer />
    </>
  );
}
