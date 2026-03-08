"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Users, MapPin, Search, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/lib/auth-context";
import { listCollegeProfiles, getOrCreateEmployerData, createPartnership, createCollegeJobPosting } from "@/lib/services/employers";

interface CollegeProfile {
  id: string;
  college_name: string | null;
  description: string | null;
  ranking: string | null;
  location: string | null;
  number_of_students: string | null;
  establishment_date: string | null;
}

export default function CollegePlacementPage() {
  const router = useRouter();
  const { user, employerProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CollegeProfile | null>(null);
  const [colleges, setColleges] = useState<CollegeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnering, setPartnering] = useState(false);

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

      // Also create a college-specific job posting
      await createCollegeJobPosting({
        data: {
          employer_profile_id: employerProfile.id,
          company_name: employerProfile.name,
          college_id: college.id,
          college_name: college.college_name,
        },
      });

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
            <button
              key={college.id}
              onClick={() => setSelected(college)}
              className="text-left bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
            >
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
            </button>
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
    </div>
  );
}
