# Global Job Postings Integration Guide

## Strapi Schema

The `globaljobposting` collection type stores job data in a JSON field:

```json
{
  "kind": "collectionType",
  "collectionName": "globaljobpostings",
  "info": {
    "singularName": "globaljobposting",
    "pluralName": "globaljobpostings",
    "displayName": "globaljobposting"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "data": {
      "type": "json"
    }
  }
}
```

## Job Data Structure

Each job posting contains:

```typescript
{
  title: string;           // "Frontend Developer Intern"
  jobType: string;         // "Full Time" | "Internship" | "Part Time" | "Contract"
  experience: string;      // "Entry Level" | "Mid Level" | "Senior Level"
  location: string;        // "Bangalore, India (Remote)"
  deadline: string;        // ISO date string "2025-12-15"
  description: string;     // Full job description
  skills: string[];        // ["React", "TypeScript", "JavaScript"]
  requirements: string[];  // List of requirements
  benefits: string[];      // List of benefits
  status: string;          // "Active" | "Closed"
}
```

## Frontend Integration

### 1. Fetching Global Jobs from Strapi

```typescript
import { fetchData } from "@/lib/strapi/strapiData";

// Fetch global job postings
const token = localStorage.getItem("fomo_token");
const response = await fetchData(token, "globaljobpostings?populate=*");

// Transform Strapi response to job format
const globalJobs = response.data.map((item: any) => ({
  id: item.id.toString(),
  ...item.attributes.data, // The JSON data field contains all job info
}));
```

### 2. Using the JobPostingCard Component

```tsx
import JobPostingCard from "@/components/student-section/JobPostingCard";

// In your component
<JobPostingCard job={jobData} onApply={(jobId) => handleApply(jobId)} />;
```

### 3. Current Implementation

The jobs page (`app/students/jobs/page.tsx`) now has 3 tabs:

- **College Jobs**: Jobs from your college/institution
- **Global Opportunities**: Jobs from the `globaljobpostings` collection (currently using mock data)
- **Employers**: List of employers

## Features

✅ **Job Posting Card** includes:

- Company logo/name
- Job title and type (Full Time, Internship, etc.)
- Experience level
- Location
- Application deadline with countdown
- Job description
- Required skills (as tags)
- Requirements list
- Benefits
- Apply button (disabled after deadline)
- Status badge (Active/Expired)

✅ **Smart deadline handling**:

- Shows "X days left to apply" warning when deadline is within 7 days
- Automatically marks jobs as expired after deadline
- Disables apply button for expired jobs

✅ **Responsive design**:

- Grid layout for desktop (2 columns)
- Stack layout for mobile
- Hover effects and transitions

## Next Steps

To integrate with real Strapi data:

1. Replace the `mockGlobalJobs` array in `app/students/jobs/page.tsx` with:

```typescript
const token = localStorage.getItem("fomo_token");
const globalJobsData = await fetchData(token, "globaljobpostings?populate=*");
const globalJobs = globalJobsData.data.map((item: any) => ({
  id: item.id.toString(),
  ...item.attributes.data,
  companyName: item.attributes.data.companyName || "Company",
}));
```

2. Create a proper apply endpoint in Strapi to handle job applications

3. Add filtering/search functionality for global jobs (similar to college jobs)

## Example Strapi POST Request

To create a new global job posting:

```bash
POST http://localhost:1337/api/globaljobpostings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "data": {
      "title": "Frontend Developer Intern",
      "jobType": "Internship",
      "experience": "Entry Level",
      "location": "Bangalore, India (Remote)",
      "deadline": "2025-12-15",
      "description": "Join our team as a Frontend Developer...",
      "skills": ["React", "TypeScript", "JavaScript"],
      "requirements": ["Currently pursuing B.Tech", "Strong React knowledge"],
      "benefits": ["Stipend: ₹15,000/month", "Certificate", "Mentorship"],
      "status": "Active",
      "companyName": "TechCorp India"
    }
  }
}
```

## Notes

- The `data` field is JSON, so you can store the entire job object in it
- Make sure to validate the deadline format on the backend
- Consider adding a cron job to automatically update job status when deadline passes
- Add proper error handling for fetch failures
- Implement pagination for large job lists
