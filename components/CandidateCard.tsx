"use client";
import { Eye, Video, Heart, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/candidates";

interface CandidateCardProps {
  candidate: Candidate;
  isShortlisted: boolean;
  onViewProfile: (c: Candidate) => void;
  onToggleShortlist: (id: string) => void;
}

const scoreColor = (score: number) => {
  if (score >= 8.5) return "bg-success/15 text-success";
  if (score >= 7) return "bg-accent/15 text-accent";
  return "bg-warning/15 text-warning";
};

const CandidateCard = ({ candidate, isShortlisted, onViewProfile, onToggleShortlist }: CandidateCardProps) => {
  return (
    <div className="candidate-card animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm shrink-0">
          {candidate.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading font-semibold text-foreground leading-tight">{candidate.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{candidate.college}</p>
              <p className="text-xs text-muted-foreground">{candidate.branch} · CGPA {candidate.cgpa}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="font-heading font-bold text-sm text-accent">{candidate.matchScore}%</span>
              <span className="text-[10px] text-muted-foreground">match</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <span className={`score-badge ${scoreColor(candidate.aiScores.communication)}`}>
                Comm {candidate.aiScores.communication}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`score-badge ${scoreColor(candidate.aiScores.technical)}`}>
                Tech {candidate.aiScores.technical}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`score-badge ${scoreColor(candidate.aiScores.confidence)}`}>
                Conf {candidate.aiScores.confidence}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button size="sm" variant="default" className="h-8 text-xs gap-1.5" onClick={() => onViewProfile(candidate)}>
              <Eye className="h-3.5 w-3.5" /> View Profile
            </Button>
            <Button
              size="sm"
              variant={isShortlisted ? "default" : "outline"}
              className={`h-8 text-xs gap-1.5 ${isShortlisted ? "bg-success hover:bg-success/90" : ""}`}
              onClick={() => onToggleShortlist(candidate.id)}
            >
              <Heart className={`h-3.5 w-3.5 ${isShortlisted ? "fill-current" : ""}`} />
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
