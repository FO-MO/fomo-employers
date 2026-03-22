"use client";

import { useRouter } from "next/navigation";
import OverviewShell from "@/components/overview/OverviewShell";
import CandidatesSection from "@/components/overview/CandidatesSection";
import { useEmployerCandidates } from "@/hooks/useEmployerCandidates";

export default function DashboardPage() {
  const router = useRouter();
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
      activeTab="dashboard"
      selectedCandidate={selectedCandidate}
      shortlistedIds={shortlistedIds}
      onCloseCandidateModal={() => setSelectedCandidate(null)}
      onToggleShortlist={toggleShortlist}
    >
      <CandidatesSection
        showHero
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
        onPostJob={() => router.push("/employers/post-job")}
        onCollegePlacement={() => router.push("/employers/college-placement")}
      />
    </OverviewShell>
  );
}
