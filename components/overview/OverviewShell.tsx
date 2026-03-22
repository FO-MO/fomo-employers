"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import { useAuth } from "@/lib/auth-context";
import { type Candidate } from "@/data/candidates";

interface OverviewShellProps {
  activeTab: string;
  children: React.ReactNode;
  selectedCandidate?: Candidate | null;
  shortlistedIds?: Set<string>;
  onCloseCandidateModal?: () => void;
  onToggleShortlist?: (id: string) => void | Promise<void>;
}

const OverviewShell = ({
  activeTab,
  children,
  selectedCandidate,
  shortlistedIds,
  onCloseCandidateModal,
  onToggleShortlist,
}: OverviewShellProps) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab={activeTab} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      {selectedCandidate && onCloseCandidateModal && onToggleShortlist && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          isShortlisted={Boolean(shortlistedIds?.has(selectedCandidate.id))}
          onClose={onCloseCandidateModal}
          onToggleShortlist={onToggleShortlist}
        />
      )}
    </div>
  );
};

export default OverviewShell;
