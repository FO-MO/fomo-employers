import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves media URL for both development and production environments
 * In development: URLs are relative (e.g., /uploads/image.jpg) and need BACKEND_URL prefix
 * In production: URLs are absolute (e.g., https://cdn.example.com/image.jpg) and should be used as-is
 *
 * @param url - The media URL from Strapi
 * @returns The full URL ready to use in img src
 */
export function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If URL is already absolute (starts with http:// or https://), return as-is (production)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If URL is relative, prefix with BACKEND_URL (development)
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "";
  return `${BACKEND_URL}${url}`;
}
