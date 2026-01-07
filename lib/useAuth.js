"use client";

import { useState, useEffect } from "react";
import { getUserCookie, setUserCookie, removeUserCookie } from "./cookies";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from cookies
    const savedUser = getUserCookie();
    if (savedUser) {
      setUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (email) => {
    // Simple login - just save user data
    const userData = {
      id: "1",
      email,
      name: email.split("@")[0],
      initials: email.substring(0, 2).toUpperCase(),
    };

    setUser(userData);
    setIsLoggedIn(true);
    setUserCookie(userData);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    removeUserCookie();
  };

  return {
    isLoggedIn,
    user,
    login,
    logout,
  };
}
