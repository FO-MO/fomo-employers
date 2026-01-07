"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import PartnershipCard from "@/components/employee-section/PartnershipCard";
import SubBar from "@/components/subBar";
import { fetchFromBackend, postFetchFromBackend } from "@/lib/tools";

interface Partnership {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  badge: string;
  tier: string;
  placementRate: number;
  avgPackage: string;
  students: string;
  placementTrend: number[];
  packageGrowth: number[];
  activeJobs: number;
  rating: number;
}

interface PartnershipRawData {
  id?: string | number;
  name?: string;
  location?: string;
  verified?: boolean;
  badge?: string;
  tier?: string;
  placementRate?: string | number;
  avgPackage?: string;
  students?: string;
  placementTrend?: number[];
  packageGrowth?: number[];
  activeJobs?: number;
  rating?: number;
}

function mapPartnershipData(x: PartnershipRawData): Partnership {
  return {
    id: String(x.id || "unknown"),
    name: String(x.name || "Unknown College"),
    location: String(x.location || "Unknown Location"),
    verified: Boolean(x.verified || false),
    badge: String(x.badge || ""),
    tier: String(x.tier || "Tier-3"),
    placementRate: Number(x.placementRate) || 0,
    avgPackage: String(x.avgPackage || "N/A"),
    students: String(x.students || "N/A"),
    placementTrend: Array.isArray(x.placementTrend) ? x.placementTrend : [],
    packageGrowth: Array.isArray(x.packageGrowth) ? x.packageGrowth : [],
    activeJobs: Number(x.activeJobs) || 0,
    rating: Number(x.rating) || 0,
  };
}

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const res = await fetchFromBackend("Partnershipcards?populate=*");

        if (res && res.length > 0) {
          const mappedPartnerships = res.map(
            (item: { data?: PartnershipRawData }) => {
              const x = item.data || {};
              return mapPartnershipData(x);
            }
          );
          setPartnerships(mappedPartnerships);
        } else {
          setError("No partnerships data found");
        }
      } catch (err) {
        console.error("Error fetching partnerships:", err);
        setError("Failed to fetch partnerships");
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerships();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Modal state for job posting
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<{
    name: string;
    id: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    jobType: "Full Time",
    experience: "Entry Level",
    deadline: "",
    description: "",
    skills: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newReq, setNewReq] = useState("");
  const [newBen, setNewBen] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.title.trim().length < 5)
      newErrors.title = "Job title must be at least 5 characters";
    if (formData.description.trim().length < 50)
      newErrors.description = "Job description must be at least 50 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = (
    field: "skills" | "requirements" | "benefits",
    value: string
  ) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    if (field === "skills") setNewSkill("");
    if (field === "requirements") setNewReq("");
    if (field === "benefits") setNewBen("");
  };

  const handlePostJobClick = (college: { name: string; id: string }) => {
    setSelectedCollege(college);
    setIsModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      data: {
        data: {
          title: formData.title,
          jobType: formData.jobType,
          experience: formData.experience,
          deadline: formData.deadline || null,
          description: formData.description,
          skills: formData.skills,
          requirements: formData.requirements,
          benefits: formData.benefits,
          status: "Active",
        },
      },
    };

    try {
      await postFetchFromBackend("collegejobpostings", payload);

      // Success
      setIsConfirmOpen(false);
      setIsModalOpen(false);
      setToastMessage(`Job posted successfully to ${selectedCollege?.name}!`);
      setShowToast(true);

      // Reset form
      setFormData({
        title: "",
        jobType: "Full Time",
        experience: "Entry Level",
        deadline: "",
        description: "",
        skills: [],
        requirements: [],
        benefits: [],
      });

      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error posting job:", error);
      alert(
        `Failed to post job: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading partnerships...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  //SEARCH BAR MECHANISM
  /**
   * Helper function to check if a single field includes the search query.
   * @param {string} fieldValue - The value of the field (e.g., partnership.name).
   * @param {string} normalizedQuery - The lowercase search query.
   * @returns {boolean} - True if the field contains the query.
   */
  const doesFieldMatch = (
    fieldValue: unknown,
    normalizedQuery: string
  ): boolean => {
    // Check if the field is a non-empty string before converting to lowercase.
    if (typeof fieldValue === "string" && fieldValue.length > 0) {
      return fieldValue.toLowerCase().includes(normalizedQuery);
    }
    return false;
  };

  // --- Main Filtering Logic ---
  const filteredPartnerships = partnerships.filter((partnership) => {
    // Normalize the search query once for efficiency
    const normalizedSearchQuery = searchQuery.toLowerCase();

    // 1. **Search Match (Logical OR)**
    // Define all the partnership fields you want to search against.
    const searchableFields = [
      partnership.name,
      partnership.location,
      // Add more fields here as needed (e.g., partnership.category, partnership.description)
    ];

    // .some() returns true if ANY field matches the query (Logical OR)
    const matchesSearch = searchableFields.some((field) =>
      doesFieldMatch(field, normalizedSearchQuery)
    );

    // 2. **Tier Filter (Logical AND)**
    const matchesTier =
      tierFilter === "All Tiers" || partnership.tier === tierFilter;

    // 3. **Location Filter (Logical AND)**
    // This is for a specific filter dropdown, not the general search query.
    const matchesLocationFilter =
      locationFilter === "All Locations" ||
      partnership.location.includes(locationFilter);

    // 4. **Final Result (Logical AND)**
    // A partnership must satisfy ALL three conditions (Search AND Tier AND Location Filter)
    return matchesSearch && matchesTier && matchesLocationFilter;
  });
  //

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SubBar
          items={[
            { url: "/employers/overview", name: "Overview", logo: "👤" },
            {
              url: "/employers/applications",
              name: "Applications",
              logo: "📈",
            },
            {
              url: "/employers/partnerships",
              name: "College Partnerships",
              logo: "🎓",
            },
            { url: "/employers/jobpostings", name: "Job Postings", logo: "🧳" },
            // { url: "/employers/analytics", name: "Analytics", logo: "📊" },
          ]}
          className="mb-10"
        />
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                College Partnerships
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Build relationships with top educational institutions
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-semibold">
                <span>+</span>
                Add Partnership
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search colleges by name or location..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option>All Tiers</option>
              <option>Tier-1</option>
              <option>Tier-2</option>
              <option>Tier-3</option>
            </select>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option>All Locations</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option>Pilani</option>
              <option>Tiruchirappalli</option>
            </select>
          </div>
        </div>

        {/* Partnership Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPartnerships.map((partnership) => (
            <PartnershipCard
              key={partnership.id}
              {...partnership}
              onPostJobClick={handlePostJobClick}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPartnerships.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No partnerships found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Job Posting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl sm:text-base"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-lg sm:text-xl font-semibold mb-1 pr-8">
              Post Job to {selectedCollege?.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Fill out the details below to post a new job opening to this
              college.
            </p>

            {/* Job Title */}
            <div className="mb-4">
              <label className="text-xs sm:text-sm font-medium">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g., Software Engineer, Product Manager"
                className="mt-1 w-full border rounded-md p-2 text-sm"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Job Type / Experience */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium">
                  Job Type
                </label>
                <select
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  value={formData.jobType}
                  onChange={(e) =>
                    setFormData({ ...formData, jobType: e.target.value })
                  }
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium">
                  Experience Level
                </label>
                <select
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                >
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                </select>
              </div>
            </div>

            {/* Application Deadline */}
            <div className="mb-4">
              <label className="text-xs sm:text-sm font-medium">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md p-2 text-sm"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />
            </div>

            {/* Job Description */}
            <div className="mb-4">
              <label className="text-xs sm:text-sm font-medium">
                Job Description
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                className="mt-1 w-full border rounded-md p-2 h-20 sm:h-24 text-sm"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-4">
              <label className="text-sm font-medium">
                Skills Required (Optional)
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="flex-1 border rounded-md p-2"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button
                  onClick={() => addItem("skills", newSkill)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <label className="text-sm font-medium">
                Requirements (Optional)
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Add a requirement..."
                  className="flex-1 border rounded-md p-2"
                  value={newReq}
                  onChange={(e) => setNewReq(e.target.value)}
                />
                <button
                  onClick={() => addItem("requirements", newReq)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <label className="text-sm font-medium">Benefits (Optional)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Add a benefit..."
                  className="flex-1 border rounded-md p-2"
                  value={newBen}
                  onChange={(e) => setNewBen(e.target.value)}
                />
                <button
                  onClick={() => addItem("benefits", newBen)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.benefits.map((ben, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {ben}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm order-2 sm:order-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 text-sm order-1 sm:order-2"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Job Posting
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This job posting will be sent to {selectedCollege?.name} and{" "}
                <strong>cannot be edited</strong> after submission. Are you sure
                you want to continue?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCancelConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors disabled:opacity-50 min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-teal-700 text-white px-4 py-2 rounded-md shadow-md z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
