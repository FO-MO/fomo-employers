# Media URL Utility - Development & Production Support

## Overview

Created a unified utility function `getMediaUrl()` that handles media URLs for both development and production environments automatically.

## The Problem

- **Development**: Strapi returns relative URLs (e.g., `/uploads/image.jpg`) that need the backend URL prefix
- **Production**: Strapi returns absolute URLs (e.g., `https://cdn.example.com/image.jpg`) that should be used as-is

## The Solution

### New Utility Function

Location: `lib/utils.ts`

```typescript
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
```

## Files Updated

### 1. Core Utility

- ✅ `lib/utils.ts` - Added `getMediaUrl()` function

### 2. Profile Pages

- ✅ `app/students/profile/page.tsx` - Post images, background, and profile pictures
- ✅ `app/profile/page.tsx` - Generic profile page images
- ✅ `app/employers/profile/page.tsx` - Employer profile images

### 3. Content Pages

- ✅ `app/students/page.tsx` - Post images and user avatars
- ✅ `app/students/projects/page.tsx` - Project thumbnails
- ✅ `app/students/clubs/[clubId]/page.tsx` - Video URLs and thumbnails

## Usage Examples

### Before (Development-only)

```typescript
const imageUrl = `${BACKEND_URL}${profile.profilePic.url}`;
```

### After (Works in both environments)

```typescript
const imageUrl = getMediaUrl(profile.profilePic?.url);
```

### With Array Mapping

```typescript
// Before
const images = post.images?.map((img) => `${BACKEND_URL}${img.url}`) || [];

// After
const images =
  post.images
    ?.map((img) => getMediaUrl(img.url))
    .filter((url): url is string => url !== null) || [];
```

## Benefits

1. **Environment Agnostic**: Works automatically in both development and production
2. **Type Safe**: Returns `string | null` with proper TypeScript typing
3. **Null Safe**: Handles `null` and `undefined` inputs gracefully
4. **Future Proof**: No code changes needed when moving between environments
5. **Consistent**: Single source of truth for all media URL handling

## Testing

### Development

- URLs like `/uploads/image.jpg` will be prefixed with `NEXT_PUBLIC_BACKEND_URL`
- Result: `https://your-dev-strapi.com/uploads/image.jpg`

### Production

- URLs like `https://cdn.cloudinary.com/image.jpg` will be used as-is
- Result: `https://cdn.cloudinary.com/image.jpg`

## Migration Complete

All instances of `${BACKEND_URL}${...url}` have been replaced with `getMediaUrl()` across:

- Profile images (background & avatar)
- Post images
- Project thumbnails
- Club video URLs and thumbnails
- User avatars

No more manual environment checks needed! 🎉
