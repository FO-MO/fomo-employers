"use client";
import { Brain, TrendingUp, Code, BarChart3, Users } from "lucide-react";
import { candidates } from "@/data/candidates";

const AIInsightsSection = () => {
  const avgScore = (candidates.reduce((a, c) => a + c.aiScores.overall, 0) / candidates.length).toFixed(1);
  const topCandidates = [...candidates].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

  const skillCount: Record<string, number> = {};
  candidates.forEach((c) => c.skills.forEach((s) => { skillCount[s] = (skillCount[s] || 0) + 1; }));
  const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const branchCount: Record<string, number> = {};
  candidates.forEach((c) => { branchCount[c.branch] = (branchCount[c.branch] || 0) + 1; });
  const branchDist = Object.entries(branchCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
        <Brain className="h-5 w-5 text-accent" /> AI Hiring Insights
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Avg AI Score</span>
          </div>
          <p className="font-heading font-bold text-2xl text-foreground">{avgScore}<span className="text-sm text-muted-foreground">/10</span></p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Candidates</span>
          </div>
          <p className="font-heading font-bold text-2xl text-foreground">{candidates.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Top Match Score</span>
          </div>
          <p className="font-heading font-bold text-2xl text-foreground">{topCandidates[0]?.matchScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Candidates */}
        <div className="bg-card rounded-xl border border-border/60 p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Top Performing Candidates</h3>
          <div className="space-y-3">
            {topCandidates.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.college}</p>
                </div>
                <span className="font-heading font-bold text-sm text-accent">{c.matchScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-card rounded-xl border border-border/60 p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Code className="h-4 w-4 text-accent" /> Most Common Skills
          </h3>
          <div className="space-y-2.5">
            {topSkills.map(([skill, count]) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-24 truncate">{skill}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/70 rounded-full"
                    style={{ width: `${(count / candidates.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Distribution */}
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Branch Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {branchDist.map(([branch, count]) => (
            <div key={branch} className="text-center p-3 rounded-lg bg-muted/50">
              <p className="font-heading font-bold text-lg text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{branch}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsSection;
