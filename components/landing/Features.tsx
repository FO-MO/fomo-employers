import { Brain, Briefcase, Filter, User } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Interview Assessment",
    description: "Our AI evaluates communication, problem-solving, and domain knowledge in a bias-free, consistent format.",
  },
  {
    icon: User,
    title: "Smart Student Profiles",
    description: "Rich profiles with education, skills, projects, and AI interview scores — everything a recruiter needs at a glance.",
  },
  {
    icon: Filter,
    title: "Skill-Based Filtering",
    description: "Employers can filter candidates by skills, college, interview scores, and more to find the perfect fit.",
  },
  {
    icon: Briefcase,
    title: "Fresher Hiring Simplified",
    description: "No more sifting through thousands of resumes. Discover pre-assessed, interview-ready fresh graduates.",
  },
];

const Features = () => {
  return (
    <section id="features" className="bg-secondary/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to hire smarter
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            FOOMO combines AI-powered assessments with intelligent matching to streamline fresher hiring.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-8 card-shadow transition-all duration-300 hover:card-shadow-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
