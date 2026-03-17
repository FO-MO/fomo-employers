import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border border-border bg-accent/40 px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Start Your Career Journey
            <br />
            with <span className="text-gradient">FOOMO</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Whether you&apos;re a student looking for your first job or a company looking for fresh talent — FOOMO has you covered.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-base">
              <Link href="/auth/signup">Create Profile <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 text-base">
              <Link href="/auth/login">Hire Students</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
