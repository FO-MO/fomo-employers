"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Users, MapPin, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { candidates } from "@/data/candidates";

interface College {
  name: string;
  location: string;
  studentCount: number;
  branches: string[];
  avgCgpa: number;
}

// Derive real college data from candidates
function buildColleges(): College[] {
  const map = new Map<string, { students: typeof candidates; locations: string[] }>();

  candidates.forEach((c) => {
    if (!map.has(c.college)) {
      map.set(c.college, { students: [], locations: [] });
    }
    const entry = map.get(c.college)!;
    entry.students.push(c);
    if (!entry.locations.includes(c.location)) {
      entry.locations.push(c.location);
    }
  });

  return Array.from(map.entries()).map(([name, { students, locations }]) => {
    const branches = [...new Set(students.map((s) => s.branch))];
    const avgCgpa = +(students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(1);
    // Infer city from first student's location
    const location = locations[0]?.split(",").slice(-1)[0]?.trim() ?? "Kerala";
    return { name, location, studentCount: students.length, branches, avgCgpa };
  });
}

const colleges = buildColleges();

// Extra placeholder colleges to show a richer list
const extraColleges: College[] = [
  { name: "Rajagiri College of Engineering", location: "Ernakulam", studentCount: 0, branches: ["CS", "ECE", "Civil"], avgCgpa: 7.8 },
  { name: "Model Engineering College", location: "Ernakulam", studentCount: 0, branches: ["CS", "IT", "ECE"], avgCgpa: 8.1 },
  { name: "Federal Institute of Science and Technology", location: "Ernakulam", studentCount: 0, branches: ["CS", "ME", "EEE"], avgCgpa: 7.5 },
  { name: "LBS College of Engineering", location: "Kasaragod", studentCount: 0, branches: ["CS", "Civil", "ME"], avgCgpa: 7.6 },
];

const allColleges = [...colleges, ...extraColleges];

export default function CollegePlacementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<College | null>(null);

  const filtered = allColleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

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
          Showing <span className="font-medium text-foreground">{filtered.length}</span> colleges
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((college) => (
            <button
              key={college.name}
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
                      {college.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {college.location}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                {college.studentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {college.studentCount} students on FOOMO
                  </span>
                )}
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                  Avg CGPA {college.avgCgpa}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {college.branches.slice(0, 3).map((b) => (
                  <span key={b} className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                    {b}
                  </span>
                ))}
                {college.branches.length > 3 && (
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                    +{college.branches.length - 3} more
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
                <h2 className="font-heading font-bold text-foreground leading-snug">{selected.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" /> {selected.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Students on FOOMO</p>
                <p className="font-heading font-bold text-foreground mt-0.5">
                  {selected.studentCount > 0 ? selected.studentCount : "—"}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Average CGPA</p>
                <p className="font-heading font-bold text-foreground mt-0.5">{selected.avgCgpa}</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Departments</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.branches.map((b) => (
                  <span key={b} className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                className="flex-1 font-semibold"
                onClick={() => {
                  setSelected(null);
                  router.push("/employers/post-job");
                }}
              >
                Post Drive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
