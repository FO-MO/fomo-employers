// Minimal Strapi auth helper for client-side usage
import {
  setAuthTokenCookie,
  getAuthTokenCookie,
  removeAuthTokenCookie,
} from "@/lib/cookies";

import { AuthResponse, UserMeResponse } from "@/lib/interfaces";

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function strapiLogin(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return res.json();
}

export async function strapiRegister(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  // console.log("Register response:", res.json());
  return res.json();
}

export function setAuthToken(token: string): void {
  setAuthTokenCookie(token);
}

export function removeAuthToken(): void {
  removeAuthTokenCookie();
}

export function getAuthToken(): string | null {
  return getAuthTokenCookie();
}

export async function fetchMe(
  token: string = getAuthTokenCookie() || ""
): Promise<UserMeResponse> {
  const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
