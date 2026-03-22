"use client";

import OverviewShell from "@/components/overview/OverviewShell";
import CandidatesSection from "@/components/overview/CandidatesSection";
import { useEmployerCandidates } from "@/hooks/useEmployerCandidates";

export default function CandidatesPage() {
  const {
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
    toggleShortlist,
    rejectApplication,
  } = useEmployerCandidates();

  return (
    <OverviewShell
      activeTab="candidates"
      selectedCandidate={selectedCandidate}
      shortlistedIds={shortlistedIds}
      onCloseCandidateModal={() => setSelectedCandidate(null)}
      onToggleShortlist={toggleShortlist}
    >
      <CandidatesSection
        filters={filters}
        onFiltersChange={setFilters}
        search={search}
        onSearchChange={setSearch}
        collegePlacementOnly={collegePlacementOnly}
        onToggleCollegePlacement={() =>
          setCollegePlacementOnly((prev) => !prev)
        }
        filteredCandidates={filteredCandidates}
        allCandidatesCount={candidates.length}
        loadingCandidates={loadingCandidates}
        candidatesError={candidatesError}
        shortlistedIds={shortlistedIds}
        onViewProfile={setSelectedCandidate}
        onToggleShortlist={toggleShortlist}
        onReject={rejectApplication}
      />
    </OverviewShell>
  );
}
