"use client";

import OverviewShell from "@/components/overview/OverviewShell";
import ShortlistedSection from "@/components/ShortlistedSection";
import { useEmployerCandidates } from "@/hooks/useEmployerCandidates";

export default function ShortlistedPage() {
  const { shortlistedCandidates, toggleShortlist } = useEmployerCandidates();

  return (
    <OverviewShell activeTab="shortlisted">
      <ShortlistedSection
        candidates={shortlistedCandidates}
        onRemove={toggleShortlist}
      />
    </OverviewShell>
  );
}
