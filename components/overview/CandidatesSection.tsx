"use client";

import { Search, GraduationCap } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar";
import CandidateCard from "@/components/CandidateCard";
import { type Candidate } from "@/data/candidates";

interface CandidatesSectionProps {
  showHero?: boolean;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  search: string;
  onSearchChange: (value: string) => void;
  collegePlacementOnly: boolean;
  onToggleCollegePlacement: () => void;
  filteredCandidates: Candidate[];
  allCandidatesCount: number;
  loadingCandidates: boolean;
  candidatesError: string | null;
  shortlistedIds: Set<string>;
  onViewProfile: (candidate: Candidate) => void;
  onToggleShortlist: (id: string) => void | Promise<void>;
  onReject: (id: string) => void | Promise<void>;
  onPostJob?: () => void;
  onCollegePlacement?: () => void;
}

const CandidatesSection = ({
  showHero = false,
  filters,
  onFiltersChange,
  search,
  onSearchChange,
  collegePlacementOnly,
  onToggleCollegePlacement,
  filteredCandidates,
  allCandidatesCount,
  loadingCandidates,
  candidatesError,
  shortlistedIds,
  onViewProfile,
  onToggleShortlist,
  onReject,
  onPostJob,
  onCollegePlacement,
}: CandidatesSectionProps) => {
  return (
    <>
      {showHero && onPostJob && onCollegePlacement && (
        <HeroSection
          onPostJob={onPostJob}
          onCollegePlacement={onCollegePlacement}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <FilterSidebar filters={filters} onChange={onFiltersChange} />

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or skill..."
                className="w-full bg-card rounded-xl border border-border/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
            <button
              onClick={onToggleCollegePlacement}
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
              {filteredCandidates.length}
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
              filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isShortlisted={shortlistedIds.has(candidate.id)}
                  onViewProfile={onViewProfile}
                  onToggleShortlist={onToggleShortlist}
                  onReject={onReject}
                />
              ))
            )}

            {!loadingCandidates && allCandidatesCount === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No students found in the database.
              </div>
            ) : (
              !loadingCandidates &&
              filteredCandidates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No candidates match your filters. Try adjusting your criteria.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidatesSection;
