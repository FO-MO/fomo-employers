"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import supabase from "@/lib/supabaseClient";
import DashboardNav from "@/components/DashboardNav";
import HeroSection from "@/components/HeroSection";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar";
import CandidateCard from "@/components/CandidateCard";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import ShortlistedSection from "@/components/ShortlistedSection";
import AIInsightsSection from "@/components/AIInsightsSection";
import { type Candidate } from "@/data/candidates";
import { Search, GraduationCap } from "lucide-react";

const defaultFilters: Filters = {
  cgpaRange: [5, 10],
  college: "All Colleges",
  branch: "All Departments",
  skills: [],
  minAiScore: 0,
  minCommScore: 0,
};

interface JobApplicationRow {
  id: string;
  student_id: string;
  status: "pending" | "reviewing" | "accepted" | "rejected" | null;
  job_type: "college" | "global" | null;
  applied_at: string | null;
}

interface StudentProfileRow {
  user_id: string | null;
  name: string | null;
  college: string | null;
  course: string | null;
  cgpa: number | string | null;
  skills: unknown;
  location: string | null;
  about: string | null;
}

interface AiInterviewResultRow {
  user_id: string;
  total_raw_score: number | null;
  max_possible: number | null;
  full_report: unknown;
  role_scores: unknown;
  created_at: string | null;
}

interface UserProfileRow {
  id: string;
  email: string | null;
}

const toNumber = (value: unknown, fallback = 0) => {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
};

const normalizeScore = (value: number) =>
  Math.max(0, Math.min(10, Number(value.toFixed(1))));

const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const normalizeSkills = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};

const extractAiScores = (result?: AiInterviewResultRow) => {
  if (!result) {
    return {
      communication: 0,
      technical: 0,
      confidence: 0,
      overall: 0,
    };
  }

  const overallFromTotals =
    result.total_raw_score !== null &&
    result.max_possible &&
    result.max_possible > 0
      ? (result.total_raw_score / result.max_possible) * 10
      : 0;

  const roleScores =
    typeof result.role_scores === "object" && result.role_scores !== null
      ? (result.role_scores as Record<string, unknown>)
      : {};

  const communication = normalizeScore(
    toNumber(roleScores.communication, overallFromTotals),
  );
  const technical = normalizeScore(
    toNumber(roleScores.technical, overallFromTotals),
  );
  const confidence = normalizeScore(
    toNumber(roleScores.confidence, overallFromTotals),
  );

  const overallRaw =
    [communication, technical, confidence].reduce(
      (sum, score) => sum + score,
      0,
    ) / 3;
  const overall = normalizeScore(overallRaw || overallFromTotals);

  return {
    communication,
    technical,
    confidence,
    overall,
  };
};

export default function OverviewPage() {
  const router = useRouter();
  const { user, employerProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [collegePlacementOnly, setCollegePlacementOnly] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!user || !employerProfile) {
        setCandidates([]);
        setShortlistedIds(new Set());
        return;
      }

      setLoadingCandidates(true);
      setCandidatesError(null);

      try {
        const studentsRes = await supabase
          .from("student_profiles")
          .select(
            "user_id, name, college, course, cgpa, skills, location, about",
          )
          .order("created_at", { ascending: false });

        if (studentsRes.error) throw studentsRes.error;

        const students = (studentsRes.data ?? []) as StudentProfileRow[];
        if (students.length === 0) {
          setCandidates([]);
          setShortlistedIds(new Set());
          return;
        }

        const uniqueStudentIds = Array.from(
          new Set(
            students
              .map((s) => s.user_id)
              .filter((id): id is string => Boolean(id)),
          ),
        );

        if (uniqueStudentIds.length === 0) {
          setCandidates([]);
          setShortlistedIds(new Set());
          return;
        }

        const [aiResultsRes, userProfilesRes, applicationsRes] =
          await Promise.all([
            supabase
              .from("ai_interview_results")
              .select(
                "user_id, total_raw_score, max_possible, full_report, role_scores, created_at",
              )
              .in("user_id", uniqueStudentIds)
              .order("created_at", { ascending: false }),
            supabase
              .from("user_profiles")
              .select("id, email")
              .in("id", uniqueStudentIds),
            supabase
              .from("job_applications")
              .select("id, student_id, status, job_type, applied_at")
              .in("student_id", uniqueStudentIds)
              .order("applied_at", { ascending: false }),
          ]);

        if (aiResultsRes.error) throw aiResultsRes.error;
        if (userProfilesRes.error) throw userProfilesRes.error;
        if (applicationsRes.error) throw applicationsRes.error;

        const applications = (applicationsRes.data ??
          []) as JobApplicationRow[];

        const latestApplicationByStudentId = new Map<
          string,
          JobApplicationRow
        >();
        for (const application of applications) {
          if (!latestApplicationByStudentId.has(application.student_id)) {
            latestApplicationByStudentId.set(
              application.student_id,
              application,
            );
          }
        }

        const acceptedStudentIds = Array.from(
          latestApplicationByStudentId.entries(),
        )
          .filter(([, application]) => application.status === "accepted")
          .map(([studentId]) => studentId);
        setShortlistedIds(new Set(acceptedStudentIds));

        const aiMap = new Map<string, AiInterviewResultRow>();
        for (const row of (aiResultsRes.data ?? []) as AiInterviewResultRow[]) {
          if (!aiMap.has(row.user_id)) {
            aiMap.set(row.user_id, row);
          }
        }

        const userEmailMap = new Map<string, string | null>();
        for (const row of (userProfilesRes.data ?? []) as UserProfileRow[]) {
          userEmailMap.set(row.id, row.email);
        }

        const mappedCandidates: Candidate[] = students
          .map((profile) => {
            if (!profile.user_id) {
              return null;
            }

            const latestApplication = latestApplicationByStudentId.get(
              profile.user_id,
            );
            const name = profile?.name?.trim() || "Unnamed Candidate";
            const skills = normalizeSkills(profile?.skills);
            const aiScores = extractAiScores(aiMap.get(profile.user_id));
            const statusLabel = latestApplication?.status
              ? latestApplication.status
              : null;
            const hasApplied = Boolean(latestApplication);

            return {
              id: profile.user_id,
              applicationId: latestApplication?.id ?? null,
              name,
              email: userEmailMap.get(profile.user_id) ?? null,
              college: profile?.college || "Unknown College",
              branch: profile?.course || "Unknown Department",
              cgpa: normalizeScore(toNumber(profile?.cgpa, 0)),
              skills,
              location: profile?.location || "Not specified",
              aiScores,
              matchScore: Math.round(aiScores.overall * 10),
              experience: hasApplied ? "Applied Candidate" : "Profile Only",
              projects: 0,
              avatar: getInitials(name),
              strengths: skills.slice(0, 3),
              summary:
                profile?.about ||
                (statusLabel
                  ? `Application status: ${statusLabel.charAt(0).toUpperCase()}${statusLabel.slice(1)}.`
                  : "No applications submitted yet."),
              collegePlacement: latestApplication?.job_type === "college",
              applicationStatus: latestApplication?.status ?? null,
            };
          })
          .filter((candidate): candidate is Candidate => candidate !== null);

        setCandidates(mappedCandidates);
      } catch (err: unknown) {
        console.error("Failed to load employer candidates", err);
        const message =
          err instanceof Error ? err.message : "Failed to load candidates";
        setCandidatesError(message);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };

    if (!loading) {
      loadCandidates();
    }
  }, [user, employerProfile, loading]);

  const handlePostJob = async () => {
    try {
      router.push("/employers/post-job");
    } catch (err) {
      console.error("Navigation error to /employers/post-job", err);
    }
  };

  const handleCollegePlacement = async () => {
    try {
      router.push("/employers/college-placement");
    } catch (err) {
      console.error("Navigation error to /employers/college-placement", err);
    }
  };

  const updateCandidateStatusLocally = (
    id: string,
    status: JobApplicationRow["status"],
  ) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              applicationStatus: status,
            }
          : candidate,
      ),
    );
  };

  const toggleShortlist = async (id: string) => {
    const candidate = candidates.find((item) => item.id === id);
    if (!candidate?.applicationId) {
      setCandidatesError(
        "This student has not applied to a job yet, so shortlist is unavailable.",
      );
      return;
    }

    const isAlreadyShortlisted = shortlistedIds.has(id);
    const nextStatus: JobApplicationRow["status"] = isAlreadyShortlisted
      ? "pending"
      : "accepted";

    const { error } = await supabase
      .from("job_applications")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", candidate.applicationId);

    if (error) {
      setCandidatesError(error.message);
      return;
    }

    setCandidatesError(null);
    updateCandidateStatusLocally(id, nextStatus);

    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const rejectApplication = async (id: string) => {
    const candidate = candidates.find((item) => item.id === id);
    if (!candidate?.applicationId) {
      setCandidatesError(
        "This student has not applied to a job yet, so reject is unavailable.",
      );
      return;
    }

    const { error } = await supabase
      .from("job_applications")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", candidate.applicationId);

    if (error) {
      setCandidatesError(error.message);
      return;
    }

    setCandidatesError(null);
    updateCandidateStatusLocally(id, "rejected");
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        if (c.cgpa < filters.cgpaRange[0] || c.cgpa > filters.cgpaRange[1])
          return false;
        if (filters.college !== "All Colleges" && c.college !== filters.college)
          return false;
        if (filters.branch !== "All Departments" && c.branch !== filters.branch)
          return false;
        if (
          filters.skills.length > 0 &&
          !filters.skills.some((s) => c.skills.includes(s))
        )
          return false;
        if (c.aiScores.overall < filters.minAiScore) return false;
        if (c.aiScores.communication < filters.minCommScore) return false;
        if (collegePlacementOnly && !c.collegePlacement) return false;
        if (
          search &&
          !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
        )
          return false;
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [candidates, filters, search, collegePlacementOnly]);

  const shortlistedCandidates = candidates.filter((c) =>
    shortlistedIds.has(c.id),
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {(activeTab === "dashboard" || activeTab === "candidates") && (
          <>
            {activeTab === "dashboard" && (
              <HeroSection
                onPostJob={handlePostJob}
                onCollegePlacement={handleCollegePlacement}
              />
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              <FilterSidebar filters={filters} onChange={setFilters} />

              <div className="flex-1 space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or skill..."
                      className="w-full bg-card rounded-xl border border-border/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                    />
                  </div>
                  <button
                    onClick={() => setCollegePlacementOnly((p) => !p)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors shrink-0 ${
                      collegePlacementOnly
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    College Placement
                  </button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  candidates
                </p>

                {candidatesError && (
                  <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
                    {candidatesError}
                  </div>
                )}

                <div className="space-y-3">
                  {loadingCandidates ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading candidates...
                    </div>
                  ) : (
                    filtered.map((c) => (
                      <CandidateCard
                        key={c.id}
                        candidate={c}
                        isShortlisted={shortlistedIds.has(c.id)}
                        onViewProfile={setSelectedCandidate}
                        onToggleShortlist={toggleShortlist}
                        onReject={rejectApplication}
                      />
                    ))
                  )}
                  {!loadingCandidates && candidates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No students found in the database.
                    </div>
                  ) : (
                    !loadingCandidates &&
                    filtered.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No candidates match your filters. Try adjusting your
                        criteria.
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "shortlisted" && (
          <ShortlistedSection
            candidates={shortlistedCandidates}
            onRemove={toggleShortlist}
          />
        )}

        {activeTab === "insights" && <AIInsightsSection />}

        {activeTab === "profile" && <CompanyProfileSection />}
      </main>

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          isShortlisted={shortlistedIds.has(selectedCandidate.id)}
          onClose={() => setSelectedCandidate(null)}
          onToggleShortlist={toggleShortlist}
        />
      )}
    </div>
  );
}

function CompanyProfileSection() {
  const { employerProfile } = useAuth();

  if (!employerProfile) {
    return (
      <div className="text-center py-16">
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">
          Company Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          No employer profile found. Set up your profile first.
        </p>
      </div>
    );
  }

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value: string | null | undefined;
  }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center">
        <h2 className="font-heading font-bold text-xl text-foreground">
          Company Profile
        </h2>
      </div>
      <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5">
        <Field label="Company Name" value={employerProfile.name} />
        <div className="grid grid-cols-2 gap-6">
          <Field label="Industry" value={employerProfile.industry} />
          <Field label="Location" value={employerProfile.location} />
        </div>
        <Field label="Website" value={employerProfile.website} />
        <Field label="Description" value={employerProfile.description} />
        <Field label="Specialties" value={employerProfile.specialties} />
        <div className="grid grid-cols-2 gap-6">
          <Field label="Email" value={employerProfile.email} />
          <Field
            label="Employees"
            value={employerProfile.no_of_employers?.toString()}
          />
        </div>
      </div>
    </div>
  );
}
