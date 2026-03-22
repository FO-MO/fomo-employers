"use client";

import { useAuth } from "@/lib/auth-context";

const CompanyProfileSection = () => {
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
      <p className="text-sm text-foreground">{value || "-"}</p>
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
};

export default CompanyProfileSection;
