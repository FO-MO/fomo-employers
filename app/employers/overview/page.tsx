"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import HeroSection from "@/components/HeroSection";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar";
import CandidateCard from "@/components/CandidateCard";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import ShortlistedSection from "@/components/ShortlistedSection";
import AIInsightsSection from "@/components/AIInsightsSection";
import { candidates as allCandidates, type Candidate } from "@/data/candidates";
import { Search, GraduationCap } from "lucide-react";

const defaultFilters: Filters = {
  cgpaRange: [5, 10],
  college: "All Colleges",
  branch: "All Departments",
  skills: [],
  minAiScore: 0,
  minCommScore: 0,
};

export default function OverviewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");
  const [collegePlacementOnly, setCollegePlacementOnly] = useState(false);

  const toggleShortlist = (id: string) => {
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

  const filtered = useMemo(() => {
    return allCandidates
      .filter((c) => {
        if (c.cgpa < filters.cgpaRange[0] || c.cgpa > filters.cgpaRange[1]) return false;
        if (filters.college !== "All Colleges" && c.college !== filters.college) return false;
        if (filters.branch !== "All Departments" && c.branch !== filters.branch) return false;
        if (filters.skills.length > 0 && !filters.skills.some((s) => c.skills.includes(s))) return false;
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
  }, [filters, search, collegePlacementOnly]);

  const shortlistedCandidates = allCandidates.filter((c) => shortlistedIds.has(c.id));

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {(activeTab === "dashboard" || activeTab === "candidates") && (
          <>
            {activeTab === "dashboard" && (
              <HeroSection onPostJob={() => router.push("/employers/post-job")} onCollegePlacement={() => router.push("/employers/college-placement")} />
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
                  Showing <span className="font-medium text-foreground">{filtered.length}</span> candidates
                </p>

                <div className="space-y-3">
                  {filtered.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      isShortlisted={shortlistedIds.has(c.id)}
                      onViewProfile={setSelectedCandidate}
                      onToggleShortlist={toggleShortlist}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No candidates match your filters. Try adjusting your criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "shortlisted" && (
          <ShortlistedSection candidates={shortlistedCandidates} onRemove={toggleShortlist} />
        )}

        {activeTab === "insights" && <AIInsightsSection />}

        {activeTab === "profile" && (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Company Profile</h2>
            <p className="text-sm text-muted-foreground">Company profile settings coming soon.</p>
          </div>
        )}
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
