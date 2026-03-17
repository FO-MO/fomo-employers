import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="hero-gradient relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/40" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-accent/30" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground card-shadow">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Now open for early access
        </div>

        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Bridge Between <span className="text-gradient">Students</span> and <span className="text-gradient">Companies</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          FOOMO helps freshers showcase their skills through AI-powered interviews and get discovered by top companies hiring talent.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 px-8 text-base">
            <Link href="/auth/signup">Get Started <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
