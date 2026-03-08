"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/lib/auth-context";
import { createGlobalJobPosting } from "@/lib/services/employers";

export default function PostJobPage() {
  const router = useRouter();
  const { user, employerProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user || !employerProfile) {
      router.push("/auth/login");
      return;
    }

    setSubmitting(true);

    try {
      await createGlobalJobPosting({
        employer_profile_id: employerProfile.id,
        title: form.title,
        department: form.department || null,
        location: form.location || null,
        type: form.type || null,
        salary: form.salary ? parseInt(form.salary, 10) : null,
        description: form.description || null,
        requirements: form.requirements || null,
      });

      router.replace("/employers/overview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post job";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab="" onTabChange={() => router.push("/employers/overview")} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Post a Hiring Requirement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below to find the best-matched freshers for your role.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Details */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Role Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Job Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Bangalore / Remote"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Job Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                >
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Salary (₹/yr)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 600000"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground">Job Description</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the role and responsibilities..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Requirements</label>
              <textarea
                rows={3}
                placeholder="List any specific requirements or qualifications..."
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
              />
            </div>
          </section>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pb-8">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitting ? "Posting..." : "Post Requirement"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
