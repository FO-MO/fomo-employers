import { Bot, Sparkles, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build your student profile with your education, skills, and projects.",
  },
  {
    icon: Bot,
    title: "Take an AI Interview",
    description: "Complete a short AI-powered interview that evaluates your skills and communication.",
  },
  {
    icon: Sparkles,
    title: "Get Discovered",
    description: "Companies browse verified profiles and reach out to candidates that match their needs.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Three steps to your first opportunity
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-border bg-card p-8 text-center card-shadow transition-all duration-300 hover:card-shadow-hover"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="mb-2 text-sm font-semibold text-primary">Step {index + 1}</div>
              <h3 className="font-heading text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
