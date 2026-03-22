"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import supabase from "@/lib/supabaseClient";
import { type Candidate } from "@/data/candidates";
import { type Filters } from "@/components/FilterSidebar";

export const defaultFilters: Filters = {
  cgpaRange: [0, 10],
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
  role_scores: unknown;
}

interface UserProfileRow {
  id: string;
  email: string | null;
}

interface CandidateCacheEntry {
  userId: string;
  candidates: Candidate[];
  shortlistedIds: string[];
  savedAt: number;
}

const CANDIDATE_CACHE_TTL_MS = 5 * 60 * 1000;
const CANDIDATE_CACHE_KEY = "fomo-employer-candidates-cache-v1";
const memoryCache = new Map<string, CandidateCacheEntry>();

const readSessionCache = (userId: string): CandidateCacheEntry | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CANDIDATE_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CandidateCacheEntry;
    if (
      !parsed ||
      parsed.userId !== userId ||
      !Array.isArray(parsed.candidates) ||
      !Array.isArray(parsed.shortlistedIds)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeSessionCache = (entry: CandidateCacheEntry) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(CANDIDATE_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage write failures
  }
};

const isCacheFresh = (entry: CandidateCacheEntry) =>
  Date.now() - entry.savedAt < CANDIDATE_CACHE_TTL_MS;

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

export const useEmployerCandidates = () => {
  const { user, loading } = useAuth();

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

  const persistCache = (
    nextCandidates: Candidate[],
    nextShortlistedIds: Set<string>,
  ) => {
    if (!user) return;

    const nextCacheEntry: CandidateCacheEntry = {
      userId: user.id,
      candidates: nextCandidates,
      shortlistedIds: Array.from(nextShortlistedIds),
      savedAt: Date.now(),
    };

    memoryCache.set(user.id, nextCacheEntry);
    writeSessionCache(nextCacheEntry);
  };

  useEffect(() => {
    const loadCandidates = async () => {
      if (!user) {
        setCandidates([]);
        setShortlistedIds(new Set());
        return;
      }

      const cachedFromMemory = memoryCache.get(user.id);
      if (
        cachedFromMemory &&
        isCacheFresh(cachedFromMemory) &&
        cachedFromMemory.candidates.length > 0
      ) {
        setCandidates(cachedFromMemory.candidates);
        setShortlistedIds(new Set(cachedFromMemory.shortlistedIds));
        setCandidatesError(null);
        return;
      }

      const cachedFromSession = readSessionCache(user.id);
      if (
        cachedFromSession &&
        isCacheFresh(cachedFromSession) &&
        cachedFromSession.candidates.length > 0
      ) {
        setCandidates(cachedFromSession.candidates);
        setShortlistedIds(new Set(cachedFromSession.shortlistedIds));
        setCandidatesError(null);
        memoryCache.set(user.id, cachedFromSession);
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
                "user_id, total_raw_score, max_possible, role_scores, created_at",
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

        const mappedCandidates = students.flatMap((profile): Candidate[] => {
          if (!profile.user_id) {
            return [];
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

          return [
            {
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
            },
          ];
        });

        setCandidates(mappedCandidates);
        const nextShortlistedSet = new Set(acceptedStudentIds);
        setShortlistedIds(nextShortlistedSet);

        const nextCacheEntry: CandidateCacheEntry = {
          userId: user.id,
          candidates: mappedCandidates,
          shortlistedIds: acceptedStudentIds,
          savedAt: Date.now(),
        };
        memoryCache.set(user.id, nextCacheEntry);
        writeSessionCache(nextCacheEntry);
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
  }, [user, loading]);

  const updateCandidateStatusLocally = (
    id: string,
    status: JobApplicationRow["status"],
  ): Candidate[] => {
    return candidates.map((candidate) =>
      candidate.id === id
        ? {
            ...candidate,
            applicationStatus: status,
          }
        : candidate,
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

    const nextCandidates = updateCandidateStatusLocally(id, nextStatus);
    const nextShortlistedIds = new Set(shortlistedIds);
    if (nextShortlistedIds.has(id)) {
      nextShortlistedIds.delete(id);
    } else {
      nextShortlistedIds.add(id);
    }

    setCandidatesError(null);
    setCandidates(nextCandidates);
    setShortlistedIds(nextShortlistedIds);
    persistCache(nextCandidates, nextShortlistedIds);
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

    const nextCandidates = updateCandidateStatusLocally(id, "rejected");
    const nextShortlistedIds = new Set(shortlistedIds);
    nextShortlistedIds.delete(id);

    setCandidatesError(null);
    setCandidates(nextCandidates);
    setShortlistedIds(nextShortlistedIds);
    persistCache(nextCandidates, nextShortlistedIds);
  };

  const filteredCandidates = useMemo(() => {
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

  const shortlistedCandidates = useMemo(
    () => candidates.filter((c) => shortlistedIds.has(c.id)),
    [candidates, shortlistedIds],
  );

  return {
    candidates,
    loadingCandidates,
    candidatesError,
    filters,
    setFilters,
    shortlistedIds,
    selectedCandidate,
    setSelectedCandidate,
    search,
    setSearch,
    collegePlacementOnly,
    setCollegePlacementOnly,
    filteredCandidates,
    shortlistedCandidates,
    toggleShortlist,
    rejectApplication,
  };
};
