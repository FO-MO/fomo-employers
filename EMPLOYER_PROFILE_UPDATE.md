# Employer Profile Setup - Schema Update

## Overview

Updated the employer setup profile page to match the new Strapi schema and implement cookie-based authentication.

## Schema Changes Implemented

### New Fields Added:

1. **email** (string) - Company email address (required)
2. **phoneNumber** (integer) - Company phone number (optional)
3. **country_code** (integer) - Country code for phone number (optional)

### Existing Fields (Already Implemented):

- **name** (string) - Company name
- **description** (text) - Company description
- **profilePic** (media) - Company profile picture
- **backgroundImg** (media) - Background image
- **website** (string) - Company website
- **industry** (string) - Industry type
- **location** (text) - Company location
- **noOfEmployers** (biginteger) - Number of employees
- **specialties** (text) - Company specialties (stored as comma-separated)
- **user** (relation) - OneToOne relation with user

## UI Changes

### Step 1 - Basic Information (Updated)

Added two new fields after the website field:

1. **Company Email** (Required)

   - Email validation implemented
   - Auto-populated from user cookie if available
   - Error handling for invalid email format

2. **Company Phone Number** (Optional)
   - Country code dropdown (+91, +1, +44, +971, +65)
   - Phone number input field
   - Properly formatted for Strapi integer field

## Authentication Updates

### Cookie Implementation

Changed from `localStorage` to secure cookies:

**Before:**

```javascript
const token = localStorage.getItem("fomo_token");
```

**After:**

```javascript
const { getAuthTokenCookie, getUserCookie } = await import("@/lib/cookies");
const token = getAuthTokenCookie();
const user = getUserCookie();
```

### Auto-population

- Email is automatically populated from user cookie data on page load
- Reduces manual entry and ensures consistency

## Data Formatting

### Phone Number Handling

```typescript
phoneNumber: formData.phoneNumber ? parseInt(formData.phoneNumber) : null,
country_code: formData.country_code ? parseInt(formData.country_code.replace("+", "")) : null,
```

- Phone number stored as integer (as per schema)
- Country code stored as integer without "+" prefix
- Both fields are optional (null if not provided)

## Validation

### Email Validation (Step 1)

```typescript
if (!formData.email.trim()) {
  newErrors.email = "Email is required";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  newErrors.email = "Please enter a valid email address";
}
```

### Existing Validations

- Company name (required)
- Industry (required)
- Location (required)
- Description (minimum 50 characters)
- At least one specialty

## API Integration

### Profile Creation Payload

```typescript
const profileData = {
  data: {
    name: formData.name,
    description: formData.description,
    website: formData.website || null,
    industry: formData.industry,
    location: formData.location,
    noOfEmployers: formData.noOfEmployers
      ? parseInt(formData.noOfEmployers)
      : null,
    specialties: formData.specialties.join(", "),
    email: formData.email,
    phoneNumber: formData.phoneNumber ? parseInt(formData.phoneNumber) : null,
    country_code: formData.country_code
      ? parseInt(formData.country_code.replace("+", ""))
      : null,
    user: userData.id,
  },
};
```

### Endpoints Used

- `POST /api/employer-profiles` - Create profile
- `GET /api/users/me` - Get current user
- `POST /api/upload` - Upload images
- `PUT /api/users/{id}` - Update user hasProfile flag

## Testing Checklist

- [ ] Form loads with email pre-populated from user data
- [ ] Email validation works (required + format check)
- [ ] Phone number with country code saves correctly
- [ ] All existing fields still work properly
- [ ] Profile creation succeeds with new fields
- [ ] Cookie authentication works throughout the flow
- [ ] Images upload correctly
- [ ] Redirect to employer dashboard after completion
- [ ] Error handling for API failures

## Country Code Options

Currently supported:

- +91 (India)
- +1 (USA/Canada)
- +44 (UK)
- +971 (UAE)
- +65 (Singapore)

Can be easily extended by adding more options to the select dropdown.

## Notes

- Phone number and country code are optional fields
- Email is required for employer profiles
- All data types match the Strapi schema exactly
- Cookie-based authentication ensures better security
- Form maintains 3-step wizard structure for better UX
