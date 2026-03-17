import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Link href="/" className="font-heading text-xl font-extrabold text-foreground">
              FOOMO
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              The student-first career platform that bridges the gap between freshers and companies.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-foreground">Platform</h4>
              <a href="#how-it-works" className="block text-muted-foreground transition-colors hover:text-foreground">How it Works</a>
              <a href="#features" className="block text-muted-foreground transition-colors hover:text-foreground">Features</a>
              <a href="#companies" className="block text-muted-foreground transition-colors hover:text-foreground">For Companies</a>
            </div>
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-foreground">Company</h4>
              <a href="#" className="block text-muted-foreground transition-colors hover:text-foreground">About FOOMO</a>
              <a href="#" className="block text-muted-foreground transition-colors hover:text-foreground">Contact</a>
              <a href="https://foomo.in" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground transition-colors hover:text-foreground">foomo.in</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FOOMO. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
