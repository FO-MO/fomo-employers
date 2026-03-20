"use client";
import { X, Heart, Mail, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/candidates";

interface CandidateWithEmail extends Candidate {
  email?: string | null;
}

interface Props {
  candidate: CandidateWithEmail;
  isShortlisted: boolean;
  onClose: () => void;
  onToggleShortlist: (id: string) => void;
}

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}/10</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all duration-500"
        style={{ width: `${value * 10}%` }}
      />
    </div>
  </div>
);

const CandidateProfileModal = ({ candidate, isShortlisted, onClose, onToggleShortlist }: Props) => {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xl">
              {candidate.avatar}
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">{candidate.name}</h2>
              <p className="text-sm text-muted-foreground">{candidate.college}</p>
              <p className="text-sm text-muted-foreground">{candidate.branch} · CGPA {candidate.cgpa}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Score */}
          <div className="flex items-center gap-3 bg-accent/10 rounded-xl p-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <span className="font-heading font-bold text-2xl text-accent">{candidate.matchScore}%</span>
              <span className="text-sm text-muted-foreground ml-2">AI Match Score</span>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-2">AI Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <span key={s} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* AI Scores */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-3">AI Interview Scores</h3>
            <div className="space-y-3">
              <ScoreBar label="Communication" value={candidate.aiScores.communication} />
              <ScoreBar label="Technical Knowledge" value={candidate.aiScores.technical} />
              <ScoreBar label="Confidence" value={candidate.aiScores.confidence} />
              <ScoreBar label="Overall" value={candidate.aiScores.overall} />
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Key Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.strengths.map((s) => (
                <span key={s} className="text-xs px-3 py-1 rounded-full bg-success/10 text-success">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Location</span>
              <p className="font-medium text-foreground">{candidate.location}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Experience</span>
              <p className="font-medium text-foreground">{candidate.experience}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Projects</span>
              <p className="font-medium text-foreground">{candidate.projects} projects</p>
            </div>
            {candidate.portfolio && (
              <div>
                <span className="text-muted-foreground">Portfolio</span>
                <a href={candidate.portfolio} className="font-medium text-accent flex items-center gap-1 hover:underline">
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => onToggleShortlist(candidate.id)}
              className={isShortlisted ? "bg-success hover:bg-success/90" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isShortlisted ? "fill-current" : ""}`} />
              {isShortlisted ? "Shortlisted" : "Shortlist Candidate"}
            </Button>
            {candidate.email ? (
              <Button asChild variant="outline">
                <a href={`mailto:${candidate.email}`} className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> Contact Student
                </a>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <Mail className="h-4 w-4 mr-2" /> Contact Student
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
