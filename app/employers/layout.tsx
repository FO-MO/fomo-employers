"use client";

export const dynamic = "force-dynamic";

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/bars/Navbar";
import { useState, useEffect } from "react";
import { fetchFromBackend } from "@/lib/tools";

//SEO NEEDS TO BE DONE...

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "FOOMO - AI-Powered Career Platform for Students & Job Seekers",
//   description:
//     "Never Fear Missing Out on your dream job. FOOMO automates your career journey with AI-powered job recommendations, personalized upskilling, networking automation, and direct college placement connections.",
//   keywords: [
//     "AI career platform",
//     "student job placement",
//     "AI-powered job search",
//     "career automation",
//     "college placement",
//     "student networking",
//     "personalized learning paths",
//     "upskilling platform",
//     "job recommendations",
//     "campus placements",
//     "career development for students",
//     "AI networking",
//     "automated job matching",
//     "student career platform",
//     "entry-level jobs",
//     "internship opportunities",
//     "college to career",
//     "job portal for students",
//     "AI career advisor",
//     "career guidance platform",
//   ],
//   authors: [{ name: "FOOMO Team" }],
//   creator: "FOOMO",
//   publisher: "FOOMO",
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },
//   openGraph: {
//     type: "website",
//     locale: "en_US",
//     url: "https://FOOMO.app",
//     title: "FOOMO - AI-Powered Career Platform for Students",
//     description:
//       "Automate your entire career journey with AI-powered upskilling, networking, and college placement automation. Never miss out on your dream job.",
//     siteName: "FOOMO",
//     images: [
//       {
//         url: "/og-image.png",
//         width: 1200,
//         height: 630,
//         alt: "FOOMO - AI-Powered Career Platform",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "FOOMO - AI-Powered Career Platform for Students",
//     description:
//       "Automate your career journey with AI-powered job recommendations, upskilling, and networking automation.",
//     images: ["/og-image.png"],
//     creator: "@FOOMO_app",
//   },
//   viewport: {
//     width: "device-width",
//     initialScale: 1,
//     maximumScale: 5,
//   },
//   verification: {
//     google: "your-google-verification-code",
//     // yandex: "your-yandex-verification-code",
//     // yahoo: "your-yahoo-verification-code",
//   },
//   alternates: {
//     canonical: "https://FOOMO.app",
//   },
//   category: "Career Development",
// };

interface DashboardData {
  applicationNumber?: number;
  applicationPercentage?: number;
  activeJobs?: number;
  activeJobsCollege?: number;
  activeJobsWeek?: number;
  hireTime?: number;
  hireTimeIndustrial?: number;
  hireTimeImprovement?: number;
  hireMonth?: number;
  hireConversion?: number;
  hirePercent?: number;
  costSave?: number;
  costRednpercentage?: number;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/employers/profile";
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadDashData = async () => {
      try {
        const res = await fetchFromBackend("employer-dash-tiles?populate=*");
        if (res && res.length > 0) {
          setDashData(res[0]);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadDashData();
  }, []);

  const stats = dashData
    ? [
        {
          title: "Total Applications",
          value: dashData.applicationNumber || 0,
          subtitle: "This month",
          change: `+${dashData.applicationPercentage || 0}% from last month`,
          icon: (
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M5 3v18M5 7h7a4 4 0 110 8H5" />
            </svg>
          ),
        },
        {
          title: "Active Jobs",
          value: dashData.activeJobs || 0,
          subtitle: `Across ${dashData.activeJobsCollege || 0} colleges`,
          change: `+ ${dashData.activeJobsWeek || 0} new this week`,
          icon: (
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M4 7h16M10 11v6m4-6v6M6 7V4h12v3" />
            </svg>
          ),
        },
        {
          title: "Avg. Time to Hire",
          value: dashData.hireTime || 0,
          subtitle: `Industry avg: ${dashData.hireTimeIndustrial || 0} days`,
          change: `-${dashData.hireTimeImprovement || 0} days improved`,
          icon: (
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M12 6v6l4 2M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          ),
        },
        {
          title: "Hires This Month",
          value: dashData.hireMonth || 0,
          subtitle: `${dashData.hireConversion || 0}% conversion rate`,
          change: `+${dashData.hirePercent || 0}% from last month`,
          icon: (
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M20 13V7a1 1 0 00-1-1h-5l-2-2H5a1 1 0 00-1 1v14l4-4h11a1 1 0 001-1z" />
            </svg>
          ),
        },
        {
          title: "Cost Saved vs Traditional",
          value: `₹${dashData.costSave || 0}L`,
          subtitle: "Using FOOMO platform",
          change: `${dashData.costRednpercentage || 0}% cost reduction`,
          icon: (
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M12 8c-2 0-3.5 1.5-3.5 3s1.5 3 3.5 3 3.5 1.5 3.5 3-1.5 3-3.5 3m0-12c2 0 3.5-1.5 3.5-3S14 2 12 2 8.5 3.5 8.5 5" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="min-h-screen bg-[#f9fafb]">
          {!isProfilePage && (
            <>
              <Navbar />

              <main className="mx-auto max-w-6xl pb-14 pt-20">
                <section className="m-4 mt-8 p-6 rounded-3xl border border-white/60 bg-gradient-to-r from-[#eee] via-white to-[#eee] shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          MY COMPANY {/* from backend */}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Talent Acquisition Platform
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/employers/profile")}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm cursor-pointer"
                    >
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.014-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Profile
                    </button>
                  </div>
                </section>
                <section className="mt-8 p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                  {stats.map((stat) => (
                    <article
                      key={stat.title}
                      className="flex h-full flex-col justify-between rounded-3xl border border-white/60 bg-white p-6 shadow-[0_10px_30px_rgba(10,34,31,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(10,34,31,0.12)]"
                    >
                      <div className="flex items-start justify-between text-sm text-gray-700">
                        <span className="font-medium">{stat.title}</span>
                        {stat.icon}
                      </div>
                      <div className="mt-6 text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {stat.subtitle}
                      </p>
                      <p className="mt-3 text-xs font-medium text-emerald-600">
                        {stat.change}
                      </p>
                    </article>
                  ))}
                </section>

                <div className="mt-10 ">{children}</div>
              </main>
            </>
          )}

          {isProfilePage && <div>{children}</div>}
        </div>
      </body>
    </html>
  );
}
