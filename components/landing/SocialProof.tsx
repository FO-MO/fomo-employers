import { BrainCircuit, Building2, GraduationCap } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "10,000+", label: "Students Registered" },
  { icon: Building2, value: "250+", label: "Companies Hiring" },
  { icon: BrainCircuit, value: "50,000+", label: "AI Interviews Taken" },
];

const SocialProof = () => {
  return (
    <section className="bg-secondary/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Built to improve fresher hiring for colleges and companies
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          FOOMO is trusted by students, colleges, and companies across India to streamline the campus-to-career pipeline.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
