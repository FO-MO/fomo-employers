"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuthToken, fetchMe } from "@/lib/strapi/auth";
import EditEmployerProfileModal from "@/components/employee-section/EditEmployerProfileModal";
import { getMediaUrl } from "@/lib/utils";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  initials: string;
  backgroundImageUrl: string | null;
  profileImageUrl: string | null;
  description: string;
  website: string;
  industry: string;
  location: string;
  noOfEmployers: number;
  specialties: string;
}

interface EmployerProfile {
  name?: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  noOfEmployers?: number;
  specialties?: string;
  profilePic?: {
    url: string;
  };
  backgroundImg?: {
    url: string;
  };
}

interface UserMeResponse {
  email?: string;
  employer_profile?: EmployerProfile;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EmployerProfilePage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/auth/employerlogin");
        return;
      }

      // Get user data from API
      let employerProfile: EmployerProfile | null = null;
      let userEmail = "company@example.com";
      try {
        const data: UserMeResponse = await fetchMe(token);
        if (data && data.employer_profile) {
          employerProfile = data.employer_profile;
          userEmail = data?.email || userEmail;
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }

      if (!employerProfile) {
        router.push("/auth/employerlogin");
        return;
      }

      // Transform profile data directly from employer_profile
      const employerInfo: EmployerProfile = {
        name: employerProfile.name || "Company Name",
        description: employerProfile.description || "No description yet",
        website: employerProfile.website || "Not specified",
        industry: employerProfile.industry || "Not specified",
        location: employerProfile.location || "Not specified",
        phone: employerProfile.phoneNumber || employerProfile.phone || "N/A",
        email: employerProfile.email || userEmail,
        noOfEmployers: employerProfile.noOfEmployers || 0,
        specialties: employerProfile.specialties || "Not specified",
        profilePic: employerProfile.profilePic,
        backgroundImg: employerProfile.backgroundImg,
      };

      // Transform profile data
      const data: ProfileData = {
        name: employerInfo.name || "Company Name",
        email: userEmail,
        phone: employerInfo.phone || "Not specified",
        initials: employerInfo.name
          ? employerInfo.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "CO",
        backgroundImageUrl: getMediaUrl(employerInfo.backgroundImg?.url),
        profileImageUrl: getMediaUrl(employerInfo.profilePic?.url),
        description: employerInfo.description || "No description yet",
        website: employerInfo.website || "Not specified",
        industry: employerInfo.industry || "Not specified",
        location: employerInfo.location || "Not specified",
        noOfEmployers: employerInfo.noOfEmployers || 0,
        specialties: employerInfo.specialties || "Not specified",
      };

      setProfileData(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    // The EditEmployerProfileModal already handles the save, so we just need to reload
    await loadProfile();
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">No profile found</p>
          <button
            onClick={() => router.push("/auth/setup-profile")}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 bg-white min-h-screen">
      <section className="max-w-6xl mx-auto">
        {/* Cover Image */}
        <div className="w-full h-48 relative overflow-hidden rounded-lg mb-6">
          {profileData.backgroundImageUrl ? (
            <>
              <Image
                src={profileData.backgroundImageUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </>
          ) : (
            <>
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDQwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            </>
          )}
        </div>

        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Avatar - positioned to overlap cover image */}
          <div className="relative -mt-20 mb-6">
            <div className="relative inline-block">
              {profileData.profileImageUrl ? (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
                  <Image
                    src={profileData.profileImageUrl}
                    alt={profileData.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white border-4 border-white shadow-2xl">
                  {profileData.initials}
                </div>
              )}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
          </div>

          {/* Name, Info and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Name and Info */}
            <div className="flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {profileData.name}
              </h1>
              <p className="text-gray-600 text-base mb-3">
                {profileData.industry}
              </p>

              {/* Display company stats */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">Employees</span>
                  <span className="text-sm font-bold text-gray-900">
                    {profileData.noOfEmployers}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons removed - edit modal kept but no UI trigger */}
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description and Specialties */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Description */}
            {profileData.description && (
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  About Company
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {profileData.description}
                </p>
              </div>
            )}

            {/* Specialties */}
            {profileData.specialties &&
              profileData.specialties !== "Not specified" && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Specialties
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties
                      .split(",")
                      .map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {specialty.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

            {/* Job postings removed as requested */}
          </div>

          {/* Right Column - Company Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-4">
                {/* Email */}
                {profileData.email &&
                  profileData.email !== "company@example.com" && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <a
                        href={`mailto:${profileData.email}`}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline break-all"
                      >
                        {profileData.email}
                      </a>
                    </div>
                  )}

                {/* Phone */}
                {profileData.phone && profileData.phone !== "Not specified" && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <a
                      href={`tel:${profileData.phone}`}
                      className="text-green-600 hover:text-green-700 font-medium hover:underline"
                    >
                      {profileData.phone}
                    </a>
                  </div>
                )}

                {/* Website */}
                {profileData.website &&
                  profileData.website !== "Not specified" && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 font-medium hover:underline break-all"
                      >
                        {profileData.website}
                      </a>
                    </div>
                  )}
              </div>
            </div>

            {/* Industry */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Industry</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">
                  {profileData.industry}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">
                  {profileData.location}
                </p>
              </div>
            </div>

            {/* Company Size */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Company Size
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Employees</span>
                  <span className="text-sm font-bold text-blue-700">
                    {profileData.noOfEmployers || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {profileData && (
          <EditEmployerProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentData={{
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              description: profileData.description,
              website: profileData.website,
              industry: profileData.industry,
              location: profileData.location,
              noOfEmployers: profileData.noOfEmployers,
              specialties: profileData.specialties,
            }}
            onSave={handleSaveProfile}
          />
        )}
      </section>
    </div>
  );
}
