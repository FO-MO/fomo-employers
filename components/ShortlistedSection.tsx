"use client";
import { Heart, Send, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/candidates";

interface Props {
  candidates: Candidate[];
  onRemove: (id: string) => void;
}

const ShortlistedSection = ({ candidates, onRemove }: Props) => {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-foreground mb-1">No candidates shortlisted</h3>
        <p className="text-sm text-muted-foreground">Browse candidates and add them to your shortlist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">
          Shortlisted Candidates ({candidates.length})
        </h2>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export List
        </Button>
      </div>
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Candidate</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">College</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">AI Score</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {c.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.branch}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{c.college}</td>
                <td className="px-5 py-3.5">
                  <span className="font-heading font-bold text-accent">{c.aiScores.overall}</span>
                  <span className="text-muted-foreground">/10</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-warning/15 text-warning font-medium">Pending Review</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Send className="h-3 w-3" /> Invite
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => onRemove(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShortlistedSection;
