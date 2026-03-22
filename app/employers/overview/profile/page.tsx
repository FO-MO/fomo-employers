"use client";

import OverviewShell from "@/components/overview/OverviewShell";
import CompanyProfileSection from "@/components/overview/CompanyProfileSection";

export default function ProfilePage() {
  return (
    <OverviewShell activeTab="profile">
      <CompanyProfileSection />
    </OverviewShell>
  );
}
