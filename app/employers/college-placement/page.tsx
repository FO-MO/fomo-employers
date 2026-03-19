"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Users, MapPin, Search, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/lib/auth-context";
import {
  listCollegeProfiles,
  getOrCreateEmployerData,
  createPartnership,
  createCollegeJobPosting,
  getEmployerProfileByUserId,
} from "@/lib/services/employers";

interface CollegeProfile {
  id: string;
  college_name: string | null;
  description: string | null;
  ranking: string | null;
  location: string | null;
  number_of_students: string | null;
  establishment_date: string | null;
  user_id: string | null;
}

export default function CollegePlacementPage() {
  const router = useRouter();
  const { user, employerProfile, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CollegeProfile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [colleges, setColleges] = useState<CollegeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnering, setPartnering] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkForm, setBulkForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    deadline: '',
  });

  useEffect(() => {
    listCollegeProfiles()
      .then((data) => setColleges(data ?? []))
      .catch(() => setColleges([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = colleges.filter(
    (c) =>
      (c.college_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePartner = async (college: CollegeProfile) => {
    if (!user || !employerProfile) {
      router.push("/auth/login");
      return;
    }
    setPartnering(true);
    try {
      const employerData = await getOrCreateEmployerData(employerProfile.id);
      await createPartnership(employerData.id, college.id);

      // Partnership created, send user to post job (they can choose college-specific posting there)
      setSelected(null);
      router.push("/employers/post-job");
    } catch {
      // Partnership may already exist — proceed anyway
      setSelected(null);
      router.push("/employers/post-job");
    } finally {
      setPartnering(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);

    if (authLoading) {
      setBulkError('Please wait while your account is loading.');
      return;
    }

    if (!user) {
      setBulkError('Please sign in again.');
      router.push('/auth/login');
      return;
    }

    if (selectedIds.length === 0) return;

    setBulkSubmitting(true);
    try {
      const selectedColleges = colleges
        .filter((c) => selectedIds.includes(c.id))
        .map((c) => ({
          user_id: c.user_id,
          college_name: c.college_name,
        }));

      if (selectedColleges.length === 0) {
        setBulkError('No valid colleges were selected. Please select again.');
        return;
      }

      const collegesWithoutUserId = selectedColleges.filter((c) => !c.user_id);
      if (collegesWithoutUserId.length > 0) {
        setBulkError('One or more selected colleges are missing user mapping (user_id). Please recheck selected colleges.');
        return;
      }

      const freshProfile = await getEmployerProfileByUserId(user.id).catch(() => null);
      const resolvedEmployerProfileId = freshProfile?.id ?? employerProfile?.id ?? null;

      if (!resolvedEmployerProfileId) {
        setBulkError('Employer profile not found. Please complete your profile setup and try again.');
        return;
      }

      await getOrCreateEmployerData(resolvedEmployerProfileId);

      await createCollegeJobPosting({
        employer_profile_id: resolvedEmployerProfileId,
        title: bulkForm.title,
        department: bulkForm.department || null,
        location: bulkForm.location || null,
        type: bulkForm.type || null,
        salary: bulkForm.salary ? parseInt(bulkForm.salary, 10) : null,
        description: bulkForm.description || null,
        requirements: bulkForm.requirements || null,
        deadline: bulkForm.deadline || null,
        colleges: selectedColleges,
      });

      setBulkModalOpen(false);
      setSelectedIds([]);
      router.replace('/employers/overview');
    } catch (err) {
      console.error('Failed to create college job posting', err);
      const message = err instanceof Error
        ? err.message
        : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to create college job posting';
      setBulkError(message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab="" onTabChange={() => router.push("/employers/overview")} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">College Placement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Partner with colleges to access top student talent through placement drives.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges by name or location..."
            className="w-full bg-card rounded-xl border border-border/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>

        {/* Select All + Actions */}
        <div className="flex items-center justify-between mb-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={selectedIds.length === colleges.length && colleges.length > 0}
              onChange={(e) => {
                if (e.target.checked) setSelectedIds(colleges.map((c) => c.id));
                else setSelectedIds([]);
              }}
              className="h-4 w-4"
            />
            <span>Select all</span>
          </label>

          {selectedIds.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground mr-3">{selectedIds.length} selected</span>
              <Button className="mr-2" onClick={() => setBulkModalOpen(true)}>
                Post Drive to Selected
              </Button>
              <Button variant="outline" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {loading ? "Loading colleges..." : <>Showing <span className="font-medium text-foreground">{filtered.length}</span> colleges</>}
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((college) => (
            <div
              key={college.id}
              onClick={() => setSelected(college)}
              className="relative text-left bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(college.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedIds((prev) =>
                    e.target.checked ? [...prev, college.id] : prev.filter((id) => id !== college.id)
                  );
                }}
                className="absolute top-3 left-3 h-4 w-4"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-foreground leading-snug">
                      {college.college_name ?? "Unnamed College"}
                    </h3>
                    {college.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {college.location}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                {college.number_of_students && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {college.number_of_students} students
                  </span>
                )}
                {college.ranking && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                    Rank {college.ranking}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground text-sm">
              No colleges match your search.
            </div>
          )}
        </div>
        )}
      </main>

      {/* College Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border/60 p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground leading-snug">
                  {selected.college_name ?? "College"}
                </h2>
                {selected.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {selected.location}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="font-heading font-bold text-foreground mt-0.5">
                  {selected.number_of_students ?? "—"}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Ranking</p>
                <p className="font-heading font-bold text-foreground mt-0.5">
                  {selected.ranking ?? "—"}
                </p>
              </div>
            </div>

            {selected.description && (
              <div className="mb-5">
                <p className="text-xs font-medium text-muted-foreground mb-1">About</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                className="flex-1 font-semibold"
                disabled={partnering}
                onClick={() => handlePartner(selected)}
              >
                {partnering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {partnering ? "Partnering..." : "Post Drive"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Post Modal */}
      {bulkModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setBulkModalOpen(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border/60 p-6 max-w-2xl w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold mb-3">Post Drive to {selectedIds.length} colleges</h2>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Job Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={bulkForm.title}
                    onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })}
                    className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={bulkForm.department}
                    onChange={(e) => setBulkForm({ ...bulkForm, department: e.target.value })}
                    className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Location *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bangalore / Remote"
                    value={bulkForm.location}
                    onChange={(e) => setBulkForm({ ...bulkForm, location: e.target.value })}
                    className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Job Type</label>
                  <select
                    value={bulkForm.type}
                    onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })}
                    className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  >
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Salary (₹/yr)</label>
                <input
                  type="number"
                  placeholder="e.g. 600000"
                  value={bulkForm.salary}
                  onChange={(e) => setBulkForm({ ...bulkForm, salary: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                  value={bulkForm.description}
                  onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Requirements</label>
                <textarea
                  rows={3}
                  placeholder="List any specific requirements or qualifications..."
                  value={bulkForm.requirements}
                  onChange={(e) => setBulkForm({ ...bulkForm, requirements: e.target.value })}
                  className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
                />
              </div>

              {bulkError && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
                  {bulkError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setBulkModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 font-semibold" disabled={bulkSubmitting}>
                  {bulkSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {bulkSubmitting ? 'Posting...' : 'Post to Selected'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
