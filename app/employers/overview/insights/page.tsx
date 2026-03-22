"use client";

import OverviewShell from "@/components/overview/OverviewShell";
import AIInsightsSection from "@/components/AIInsightsSection";

export default function InsightsPage() {
  return (
    <OverviewShell activeTab="insights">
      <AIInsightsSection />
    </OverviewShell>
  );
}
