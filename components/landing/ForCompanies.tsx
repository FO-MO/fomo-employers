import { BarChart3, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Search,
    title: "Filter by Skills & College",
    description: "Search for candidates using granular filters — programming languages, degree, location, and more.",
  },
  {
    icon: BarChart3,
    title: "View AI Interview Results",
    description: "Access detailed AI assessment reports with scores on communication, technical skills, and aptitude.",
  },
  {
    icon: UserCheck,
    title: "Shortlist Instantly",
    description: "Save time by shortlisting pre-assessed candidates and reach out to them directly through the platform.",
  },
];

const ForCompanies = () => {
  return (
    <section id="companies" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">For Companies</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Hire fresh talent,
              <br />
              without the hassle
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Stop sorting through piles of resumes. FOOMO gives you a curated pool of AI-assessed, interview-ready graduates.
            </p>
            <Button size="lg" className="mt-8 gap-2 px-8">
              Start Hiring
            </Button>
          </div>

          <div className="space-y-5">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForCompanies;
