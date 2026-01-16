"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/tools";
import { getUserCookie, getAuthTokenCookie } from "@/lib/cookies";
import SubBar from "@/components/subBar";
import EditEmployerProfileModal from "@/components/employee-section/EditEmployerProfileModal";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  Mail,
  Phone,
  Edit3,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface EmployerProfile {
  id: number;
  documentId: string;
  name: string;
  description: string;
  profilePic?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
    };
  };
  backgroundImg?: {
    url: string;
    formats?: {
      large?: { url: string };
      medium?: { url: string };
    };
  };
  website: string;
  industry: string;
  location: string;
  noOfEmployers: number;
  specialties: string;
  phoneNumber: number;
  email: string;
  country_code: number;
  globaljobpostings?: Array<{
    id: number;
    documentId: string;
    title: string;
    description: string;
    location: string;
  }>;
}

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = getUserCookie();
      const token = getAuthTokenCookie();

      if (!user || !token) {
        setError("You must be logged in to view your profile");
        setLoading(false);
        return;
      }

      console.log("Fetching profile for user ID:", user.id);

      // Fetch employer profile by user relation
      const profiles = await fetchFromBackend(
        `employer-profiles?filters[user][id][$eq]=${user.id}&populate=*`
      );

      if (profiles && profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        setError("No employer profile found. Please set up your profile.");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    fetchProfile();
  };

  const getImageUrl = (
    media: EmployerProfile["profilePic"] | EmployerProfile["backgroundImg"]
  ) => {
    if (!media) return null;
    const url = media.url;
    if (url?.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
  };

  const formatPhoneNumber = (countryCode?: number, phone?: number) => {
    if (!phone) return "Not provided";
    const code = countryCode ? `+${countryCode}` : "";
    return `${code} ${phone}`;
  };

  const getSpecialtiesArray = (specialties?: string) => {
    if (!specialties) return [];
    return specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* <SubBar
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
              {
                url: "/employers/jobpostings",
                name: "Job Postings",
                logo: "🧳",
              },
            ]}
            className="mb-10"
          /> */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/auth/employer-setup-profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Set Up Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* <SubBar
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
          ]}
          className="mb-10"
        /> */}

        {/* Back Button */}
        <Link
          href="/employers/overview"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Profile Header with Cover Image */}
        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.08)] overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-r from-[#0f4f4a] to-[#1a7a6f]">
            {profile?.backgroundImg && (
              <Image
                src={getImageUrl(profile.backgroundImg) || ""}
                alt="Cover"
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 sm:px-8 pb-8">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6 sm:left-8">
              <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                {profile?.profilePic ? (
                  <Image
                    src={getImageUrl(profile.profilePic) || ""}
                    alt={profile.name || "Company"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-emerald-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Company Name and Basic Info */}
            <div className="mt-12">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profile?.name || "Company Name"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
                {profile?.industry && (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    {profile.industry}
                  </span>
                )}
                {profile?.location && (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {profile.location}
                  </span>
                )}
                {profile?.noOfEmployers && (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-emerald-600" />
                    {profile.noOfEmployers.toLocaleString()} employees
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Contact */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.08)] p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile?.description || "No description provided."}
              </p>
            </section>

            {/* Specialties Section */}
            {getSpecialtiesArray(profile?.specialties).length > 0 && (
              <section className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.08)] p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {getSpecialtiesArray(profile?.specialties).map(
                    (specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100"
                      >
                        {specialty}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Active Job Postings */}
            {profile?.globaljobpostings &&
              profile.globaljobpostings.length > 0 && (
                <section className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.08)] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Active Job Postings
                    </h2>
                    <Link
                      href="/employers/jobpostings"
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {profile.globaljobpostings.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || "Remote"}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Right Column - Contact Info Card */}
          <div className="space-y-8">
            {/* Contact Information */}
            <section className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.08)] p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">
                      {profile?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {formatPhoneNumber(
                        profile?.country_code,
                        profile?.phoneNumber
                      )}
                    </p>
                  </div>
                </div>

                {/* Website */}
                {profile?.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                {profile?.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Headquarters</p>
                      <p className="text-gray-900 font-medium">
                        {profile.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-br from-[#0f4f4a] to-[#1a7a6f] rounded-3xl shadow-[0_10px_30px_rgba(10,34,31,0.15)] p-6 sm:p-8 text-white">
              <h2 className="text-lg font-semibold mb-6">Company Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Employees</span>
                  <span className="font-semibold">
                    {profile?.noOfEmployers?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Active Jobs</span>
                  <span className="font-semibold">
                    {profile?.globaljobpostings?.length || 0}
                  </span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Industry</span>
                  <span className="font-semibold">
                    {profile?.industry || "N/A"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditEmployerProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentData={{
            name: profile.name || "",
            email: profile.email || "",
            phone: formatPhoneNumber(profile.country_code, profile.phoneNumber),
            description: profile.description || "",
            website: profile.website || "",
            industry: profile.industry || "",
            location: profile.location || "",
            noOfEmployers: profile.noOfEmployers || 0,
            specialties: profile.specialties || "",
          }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
