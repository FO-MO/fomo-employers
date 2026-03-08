"use client";
import { Users, GraduationCap, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onPostJob: () => void;
  onCollegePlacement: () => void;
}

const stats = [
  { icon: Users, value: "10,000+", label: "Students" },
  { icon: GraduationCap, value: "50+", label: "Colleges" },
  { icon: Brain, value: "AI Verified", label: "Interviews" },
  { icon: Target, value: "Skill Based", label: "Matching" },
];

const HeroSection = ({ onPostJob, onCollegePlacement }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-primary rounded-2xl p-8 md:p-12 text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(200_80%_45%/0.3),transparent_60%)]" />
      <div className="relative z-10">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Hire Job-Ready Freshers Faster
          </h1>
          <p className="text-primary-foreground/80 text-base md:text-lg mb-6 leading-relaxed">
            Access verified student talent from colleges through AI-assessed interviews and skill evaluation.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={onPostJob}
              variant="secondary"
              className="font-semibold px-6"
            >
              Post Job
            </Button>
            <Button
              onClick={onCollegePlacement}
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-semibold px-6"
            >
              College Placement
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 bg-primary-foreground/10 rounded-xl p-3.5 backdrop-blur-sm">
              <stat.icon className="h-5 w-5 text-accent shrink-0" />
              <div>
                <div className="font-heading font-bold text-sm">{stat.value}</div>
                <div className="text-xs text-primary-foreground/70">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
