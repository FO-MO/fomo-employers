/**
 * Cookie utility functions for managing authentication tokens and user data
 * Uses cookies instead of localStorage for better security and SSR compatibility
 */

import Cookies from "js-cookie";

// Cookie names
const TOKEN_COOKIE = "fomo_token";
const USER_COOKIE = "fomo_user";

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  // domain: "stable-gem-a63fa44dc9.strapiapp.com",
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production", // Only use secure in production (HTTPS)
};

/**
 * Set authentication token in cookie
 */
export function setAuthTokenCookie(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

/**
 * Get authentication token from cookie
 */
export function getAuthTokenCookie(): string | null {
  return Cookies.get(TOKEN_COOKIE) || null;
}

/**
 * Remove authentication token from cookie
 */
export function removeAuthTokenCookie(): void {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
}

interface UserData {
  documentId?: string;
  id?: number;
  username?: string;
  email?: string;
  [key: string]: unknown; // Allow for additional properties
}

/**
 * Set user data in cookie
 */
export function setUserCookie(user: UserData): void {
  Cookies.set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTIONS);
}

/**
 * Get user data from cookie
 */
export function getUserCookie(): UserData | null {
  const userStr = Cookies.get(USER_COOKIE);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    return null;
  }
}

/**
 * Remove user data from cookie
 */
export function removeUserCookie(): void {
  Cookies.remove(USER_COOKIE, { path: "/" });
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  removeAuthTokenCookie();
  removeUserCookie();
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getAuthTokenCookie();
}
