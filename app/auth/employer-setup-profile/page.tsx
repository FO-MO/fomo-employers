"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createEmployerProfile } from "@/lib/services/employers";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function EmployerSetupProfilePage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [noOfEmployers, setNoOfEmployers] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log('submitting employer profile for user:', user?.id);
      // sanitize and validate phone number to fit DB integer column
      let phoneNumber: number | undefined = undefined;
      if (phone) {
        const digits = phone.replace(/[^0-9]/g, "");
        const parsed = Number(digits);
        const MAX_INT = 2147483647; // 32-bit signed int max
        if (Number.isNaN(parsed) || parsed <= 0 || parsed > MAX_INT) {
          setError("Please enter a valid phone number that fits into the database (max 10 digits).\nE.g. +91 9876543210 -> 9876543210");
          setLoading(false);
          return;
        }
        phoneNumber = parsed;
      }

      const resp = await createEmployerProfile({
        user_id: user.id,
        name,
        email: user.email,
        industry: industry || undefined,
        location: location || undefined,
        website: website || undefined,
        description: description || undefined,
        no_of_employers: noOfEmployers ? parseInt(noOfEmployers, 10) : undefined,
        specialties: specialties || undefined,
        phone_number: phoneNumber,
      });

      console.log('createEmployerProfile response at caller:', resp);
      if (resp.error) {
        throw resp.error;
      }
      console.log('createEmployerProfile succeeded');
      await refreshProfile();
      router.push("/employers/overview");
    } catch (err: unknown) {
      console.error('createEmployerProfile error caught:', err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Set Up Your Company Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us about your organisation</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border/60 p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Company Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Tech, Finance"
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-company.com"
              className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Company Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your company do?"
              className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">No. of Employees</label>
              <input
                type="number"
                min="1"
                value={noOfEmployers}
                onChange={(e) => setNoOfEmployers(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Specialties</label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="e.g. AI, Cloud, DevOps"
              className="w-full bg-background rounded-xl border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
