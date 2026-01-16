"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import SubBar from "@/components/subBar";
import {
  Search,
  User2,
  Clock,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Building2,
  X,
} from "lucide-react";
import { fetchFromBackend } from "@/lib/tools";
import { fetchData } from "@/lib/strapi/strapiData";
import { getAuthTokenCookie } from "@/lib/cookies";
import SearchCard, { Profile } from "@/components/student-section/SearchCard";
import { useRouter } from "next/navigation";

interface ApplicationStat {
  data: {
    label: string;
    value: string | number;
    color: string;
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [collegeFilter, setCollegeFilter] = useState("All Colleges");
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [cgpaFilter, setCgpaFilter] = useState("");
  const [applicationsData, setApplicationsData] = useState<
    ApplicationStat[] | null
  >(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch application stats
        const res = await fetchFromBackend("employerapplications?populate=*");
        console.log("Fetched applications data:", res);
        setApplicationsData(res);

        // Fetch student profiles
        const token = getAuthTokenCookie();
        const data = (await fetchData(
          token,
          "student-profiles?populate=*"
        )) as {
          data?: Array<{
            id?: string | number;
            documentId?: string;
            studentId?: string;
            name?: string;
            email?: string;
            college?: string;
            skills?: string[];
            followers?: unknown[];
            following?: unknown[];
          }>;
        };

        const fetchedProfiles: Profile[] = (data.data || []).map((student) => ({
          id: Number(student.id) || 0,
          documentId: student.documentId?.toString(),
          studentId: student.studentId || "unknown",
          name: student.name || "Unknown User",
          email: student.email || "No email",
          college: student.college || "",
          skills: student.skills || [],
          followers: (student.followers || []).map(String),
          following: (student.following || []).map(String),
          isFollowing: false,
          avatarUrl: null,
        }));

        setProfiles(fetchedProfiles);
      } catch (err) {
        console.error("Failed to load applications:", err);
        setError("Failed to load applications data");
        setApplicationsData(null);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  // Reset CGPA filter when college filter changes to "All Colleges"
  const handleCollegeFilterChange = (value: string) => {
    setCollegeFilter(value);
    if (value === "All Colleges") {
      setCgpaFilter("");
    }
  };

  // Filter profiles based on search and filters
  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (profile: Profile) =>
          profile.name.toLowerCase().includes(query) ||
          profile.email?.toLowerCase().includes(query) ||
          profile.skills?.some((skill: string) =>
            skill.toLowerCase().includes(query)
          )
      );
    }

    // Filter by college
    if (collegeFilter !== "All Colleges") {
      filtered = filtered.filter(
        (profile: Profile) => profile.college === collegeFilter
      );
    }

    // Filter by skill
    if (skillFilter !== "All Skills") {
      filtered = filtered.filter((profile: Profile) =>
        profile.skills?.some(
          (skill: string) =>
            skill.toLowerCase() === skillFilter.toLowerCase()
        )
      );
    }

    return filtered;
  }, [searchTerm, collegeFilter, skillFilter, profiles]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleProfileClick = (profile: Profile) => {
    if (profile.documentId) {
      router.push(`/profile?userId=${profile.studentId}`);
    }
  };
  
  const icons = [
    <User2 key={1} className="h-5 w-5 text-gray-700" />, // Total
    <Clock key={2} className="h-5 w-5 text-yellow-500" />, // Pending
    <Eye key={3} className="h-5 w-5 text-blue-500" />, // Reviewed
    <MessageSquare key={4} className="h-5 w-5 text-purple-500" />, // Interview
    <CheckCircle2 key={5} className="h-5 w-5 text-green-500" />, // Accepted
    <XCircle key={6} className="h-5 w-5 text-red-500" />, // Rejected
    <Building2 key={7} className="h-5 w-5 text-indigo-500" />, // Colleges
  ];

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
        <div className="flex flex-col p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg border border-red-100 shadow-sm">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="mt-3 text-lg font-semibold text-gray-700">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Section */}
          {!loading && !error && applicationsData && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {applicationsData.map((item: ApplicationStat, idx: number) => {
                  const y = item.data;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center rounded-lg ${y.color} border shadow-sm p-5 transition hover:shadow-md hover:bg-white`}
                    >
                      <div className="p-2 rounded-md bg-white shadow-sm mb-2">
                        {icons[idx]}
                      </div>
                      <p className="text-sm text-gray-600">{y.label}</p>
                      <p className="text-xl font-extrabold text-gray-900 mt-1">
                        {y.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Search + Filters */}
              <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                {/* Search */}
                <div className="flex items-center w-full sm:w-1/2 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-100">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 outline-none bg-transparent text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-100 min-w-[120px]"
                  >
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Reviewed</option>
                    <option>Interview</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                  </select>

                  <select
                    value={collegeFilter}
                    onChange={(e) => handleCollegeFilterChange(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-100 min-w-[130px]"
                  >
                    <option>All Colleges</option>
                    <option>IIT Delhi</option>
                    <option>IIT Bombay</option>
                    <option>NIT Trichy</option>
                    <option>VIT Vellore</option>
                    <option>SRM University</option>
                  </select>

                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-100 min-w-[120px]"
                  >
                    <option>All Skills</option>
                    <option>React</option>
                    <option>Node.js</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>JavaScript</option>
                    <option>TypeScript</option>
                    <option>Angular</option>
                    <option>Vue.js</option>
                    <option>Machine Learning</option>
                    <option>Data Science</option>
                    <option>DevOps</option>
                    <option>UI/UX Design</option>
                    <option>Mobile Development</option>
                    <option>Backend Development</option>
                    <option>Frontend Development</option>
                    <option>Full Stack Development</option>
                  </select>

                  <div className="relative">
                    <select
                      value={cgpaFilter}
                      onChange={(e) => setCgpaFilter(e.target.value)}
                      disabled={collegeFilter === "All Colleges"}
                      className={`border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 min-w-[120px] ${
                        collegeFilter === "All Colleges"
                          ? "text-gray-400 bg-gray-50 cursor-not-allowed opacity-60"
                          : "text-gray-700"
                      }`}
                      title={
                        collegeFilter === "All Colleges"
                          ? "Select a specific college to filter by CGPA"
                          : "Filter applications by CGPA range"
                      }
                    >
                      <option value="" disabled>
                        Select CGPA Range
                      </option>
                      <option>9.0 - 10.0</option>
                      <option>8.5 - 8.9</option>
                      <option>8.0 - 8.4</option>
                      <option>7.5 - 7.9</option>
                      <option>7.0 - 7.4</option>
                      <option>6.5 - 6.9</option>
                      <option>6.0 - 6.4</option>
                      <option>Below 6.0</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                {searchTerm && (
                  <div className="text-sm text-gray-600">
                    Found{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredProfiles.length}
                    </span>{" "}
                    result{filteredProfiles.length !== 1 ? "s" : ""} for &quot;
                    {searchTerm}&quot;
                  </div>
                )}
              </div>

              {/* Student Applications Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile: Profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleProfileClick(profile)}
                      className="transition-transform duration-300 ease-in-out hover:-translate-y-2 cursor-pointer"
                    >
                      <SearchCard
                        profile={profile}
                        onFollowToggle={(profileId) => {
                          console.log("Follow toggled for profile:", profileId);
                          // Handle follow/unfollow logic here
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg border border-gray-100 shadow-sm">
                      <User2 className="h-10 w-10 text-gray-400" />
                      <p className="mt-3 text-lg font-semibold text-gray-700">
                        No Applications Found
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchTerm || collegeFilter !== "All Colleges" || skillFilter !== "All Skills"
                          ? "Try adjusting your search or filters to find what you're looking for."
                          : "You haven't received any applications yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
