"use client";
import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { skillsList } from "@/data/candidates";

export interface Filters {
  cgpaRange: [number, number];
  college: string;
  branch: string;
  skills: string[];
  minAiScore: number;
  minCommScore: number;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterSidebar = ({ filters, onChange }: FilterSidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    academic: true,
    skills: true,
    ai: true,
  });

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const toggleSkill = (skill: string) => {
    const next = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onChange({ ...filters, skills: next });
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-card rounded-xl border border-border/60 p-5 sticky top-20 space-y-5">
        <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </div>

        {/* Academic */}
        <div className="filter-section">
          <button
            onClick={() => toggle("academic")}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            Academic
            {expanded.academic ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expanded.academic && (
            <div className="space-y-4 mt-3 animate-fade-in">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  CGPA Range: {filters.cgpaRange[0]} – {filters.cgpaRange[1]}
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={filters.cgpaRange}
                  onValueChange={(v) =>
                    onChange({ ...filters, cgpaRange: v as [number, number] })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="filter-section">
          <button
            onClick={() => toggle("skills")}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            Skills
            {expanded.skills ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expanded.skills && (
            <div className="flex flex-wrap gap-1.5 mt-3 animate-fade-in">
              {skillsList.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filters.skills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Evaluation */}
        <div className="filter-section border-b-0">
          <button
            onClick={() => toggle("ai")}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            AI Evaluation
            {expanded.ai ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expanded.ai && (
            <div className="space-y-4 mt-3 animate-fade-in">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Min AI Score: {filters.minAiScore}
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[filters.minAiScore]}
                  onValueChange={(v) =>
                    onChange({ ...filters, minAiScore: v[0] })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Min Communication: {filters.minCommScore}
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[filters.minCommScore]}
                  onValueChange={(v) =>
                    onChange({ ...filters, minCommScore: v[0] })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() =>
            onChange({
              cgpaRange: [0, 10],
              college: "All Colleges",
              branch: "All Departments",
              skills: [],
              minAiScore: 0,
              minCommScore: 0,
            })
          }
          className="text-xs text-accent hover:underline w-full text-center"
        >
          Reset all filters
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
