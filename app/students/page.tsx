"use client";

export const dynamic = "force-dynamic";

import PostCard from "@/components/student-section/PostCard";
import JobPostingCard from "@/components/student-section/JobPostingCard";
import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/utils";
import { GlobalJob, Post } from "@/lib/interfaces";
import { fetchColleges } from "@/lib/strapi/strapiData";

// Access environment variables from .env.local
const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function StudentsHomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [globalJobs, setGlobalJobs] = useState<GlobalJob[]>([]);
  const [nameVal, setNameVal] = useState("");
  const [combinedFeed, setCombinedFeed] = useState<
    Array<{ type: "post" | "job"; data: Post | GlobalJob; timestamp: number }>
  >([]);
  //fetching posts
  useEffect(() => {
    // Compute initials from current user's name stored in cookies
    const fetchUser = async () => {
      try {
        const { getUserCookie } = await import("@/lib/cookies");
        const parsed = getUserCookie();
        if (parsed) {
          // Try common fields for name
          const name =
            (parsed && (parsed.name || parsed.username || parsed.email)) ||
            "User";
          // If email, strip domain
          const cleanedName =
            typeof name === "string" && name.includes("@")
              ? name.split("@")[0]
              : String(name);
          setNameVal(cleanedName);
        }
      } catch {
        setNameVal("Something");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { getAuthTokenCookie } = await import("@/lib/cookies");
        const token = getAuthTokenCookie();
        const test = await fetchColleges(token);
        console.log("============================", Object.values(test));
        const response = await fetch(
          `${STRAPI_URL}/api/posts?populate=*&sort=createdAt:desc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();
        const rawPosts = data.data || [];

        // Transform Strapi posts to match Post type
        const transformedPosts: Post[] = rawPosts.map(
          (post: {
            user?: {
              name?: string;
              username?: string;
              avatar?: { url?: string };
              profilePic?: { url?: string };
              title?: string;
              bio?: string;
              course?: string;
            };
            author?: {
              name?: string;
              username?: string;
              avatar?: { url?: string };
              profilePic?: { url?: string };
              title?: string;
              bio?: string;
              course?: string;
            };
            images?: Array<{ url?: string }>;
            title?: string;
            content?: string;
            description?: string;
            documentId?: string | number;
            id?: string | number;
            createdAt?: string;
            publishedAt?: string;
            likes?: Array<unknown>;
            comments?: Array<unknown>;
            likesCount?: number;
            commentsCount?: number;
            shares?: Array<unknown>;
            sharesCount?: number;
            isLiked?: boolean;
            likedBy?: Array<unknown>;
          }) => {
            // Get user data
            const user = (post.user || post.author || {}) as {
              name?: string;
              username?: string;
              avatar?: { url?: string };
              profilePic?: { url?: string };
              title?: string;
              bio?: string;
              course?: string;
            };
            const userName = (user.name ||
              user.username ||
              "Unknown User") as string;
            const userInitials = userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            // Get avatar URL
            const avatarUrl = getMediaUrl(
              user.avatar?.url || user.profilePic?.url
            );

            // Get images - handle both array and single image
            const images: string[] = post.images
              ? post.images
                  .map((img: { url?: string }) => getMediaUrl(img.url))
                  .filter((url): url is string => url !== null)
              : [];

            // Format date
            const createdAt = new Date(
              post.createdAt || post.publishedAt || Date.now()
            );
            const now = new Date();
            const diffInSeconds = Math.floor(
              (now.getTime() - createdAt.getTime()) / 1000
            );
            let postedAgo = "";

            if (diffInSeconds < 60) {
              postedAgo = "just now";
            } else if (diffInSeconds < 3600) {
              const minutes = Math.floor(diffInSeconds / 60);
              postedAgo = `${minutes} ${
                minutes === 1 ? "minute" : "minutes"
              } ago`;
            } else if (diffInSeconds < 86400) {
              const hours = Math.floor(diffInSeconds / 3600);
              postedAgo = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
            } else {
              const days = Math.floor(diffInSeconds / 86400);
              postedAgo = `${days} ${days === 1 ? "day" : "days"} ago`;
            }

            return {
              id:
                post.documentId?.toString() || post.id?.toString() || "unknown",
              author: {
                name: userName,
                initials: userInitials,
                avatarUrl: avatarUrl,
                title: user.title || user.bio || user.course || undefined,
              },
              postedAgo: postedAgo,
              message: post.description || "",
              images: images.length > 0 ? images : undefined,
              stats: {
                likes: post.likes || post.likesCount || 0,
                comments: post.comments || post.commentsCount || 0,
                shares: post.shares || post.sharesCount || 0,
              },
              isLiked: post.isLiked || false,
              likedBy: post.likedBy,
            };
          }
        );

        setPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  // Fetch global job postings
  useEffect(() => {
    const fetchGlobalJobs = async () => {
      try {
        const { getAuthTokenCookie } = await import("@/lib/cookies");
        const token = getAuthTokenCookie();
        const response = await fetch(
          `${STRAPI_URL}/api/globaljobpostings?populate=*&sort=createdAt:desc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const mockJobs: GlobalJob[] = data.data.map(
          (item: {
            data: {
              title?: string;
              jobType?: string;
              experience?: string;
              location?: string;
              deadline?: string;
              description?: string;
              skills?: string[];
              requirements?: string[];
              benefits?: string[];
              status?: string;
              companyName?: string;
              [key: string]: unknown;
            };
            [key: string]: unknown;
          }) => ({
            id: Math.random(),
            title: item.data.title || "Unknown Job",
            jobType: item.data.jobType || "Full-time",
            experience: item.data.experience || "Entry Level",
            location: item.data.location || "Remote",
            deadline: item.data.deadline || new Date().toISOString(),
            description: item.data.description || "",
            skills: item.data.skills || [],
            requirements: item.data.requirements || [],
            benefits: item.data.benefits || [],
            status: item.data.status || "Open",
            companyName: item.data.companyName || "Unknown Company",
            createdAt: item.createdAt,
          })
        );
        setGlobalJobs(mockJobs);
      } catch (error) {
        console.error("Error fetching global jobs:", error);
        setGlobalJobs([]);
      }
    };
    fetchGlobalJobs();
  }, []);

  // Combine posts and jobs, sort by timestamp
  useEffect(() => {
    const combined: Array<{
      type: "post" | "job";
      data: Post | GlobalJob;
      timestamp: number;
    }> = [];

    // Add posts
    posts.forEach((post) => {
      // Try to extract timestamp from postedAgo string or use current time
      let timestamp = Date.now();
      if (post.postedAgo.includes("just now")) {
        timestamp = Date.now();
      } else if (post.postedAgo.includes("minute")) {
        const minutes = parseInt(post.postedAgo);
        timestamp = Date.now() - minutes * 60 * 1000;
      } else if (post.postedAgo.includes("hour")) {
        const hours = parseInt(post.postedAgo);
        timestamp = Date.now() - hours * 60 * 60 * 1000;
      } else if (post.postedAgo.includes("day")) {
        const days = parseInt(post.postedAgo);
        timestamp = Date.now() - days * 24 * 60 * 60 * 1000;
      }

      combined.push({
        type: "post",
        data: post,
        timestamp,
      });
    });

    // Add global jobs
    globalJobs.forEach((job) => {
      const timestamp = job.createdAt
        ? new Date(job.createdAt).getTime()
        : Date.now();
      combined.push({
        type: "job",
        data: job,
        timestamp,
      });
    });

    // Sort by timestamp (most recent first)
    combined.sort((a, b) => b.timestamp - a.timestamp);

    setCombinedFeed(combined);
  }, [posts, globalJobs]);

  const handleJobApply = (jobId: string) => {
    const job = globalJobs.find((j) => j.id === jobId);
    if (job) {
      alert(`Application submitted for ${job.title} at ${job.companyName}!`);
      // TODO: Implement actual application logic
    }
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 bg-white min-h-screen">
      <section className="max-w-6xl mx-auto">
        {/* Hero Header Section */}
        <header className="mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-black">
              Welcome back, {nameVal}! 👋
            </h1>
            <p className="text-base text-black max-w-2xl">
              Share your achievements and connect with your network
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Feed (2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Composer Card */}
            <section className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-black">
                  {nameVal[0]?.toUpperCase() || "X"}
                </div>
                <button
                  onClick={() =>
                    (window.location.href = "/students/posts/create")
                  }
                  className="flex-1 text-left"
                >
                  <div className="w-full min-h-[80px] border border-gray-300 hover:border-gray-500 text-gray-500 px-3 py-2 rounded-md flex items-start cursor-pointer transition-colors">
                    {"Post what's on your mind, " + nameVal + "?"}
                  </div>
                </button>
              </div>
            </section>

            {/* Feed Section */}
            <section className="flex flex-col gap-4 mb-8">
              <h2 className="text-xl font-semibold text-black">
                Feed - Posts & Opportunities
              </h2>
              <div className="flex flex-col gap-4">
                {combinedFeed.length > 0 ? (
                  combinedFeed.map((item) => {
                    if (item.type === "post") {
                      return (
                        <PostCard
                          key={`post-${item.data.id}`}
                          post={item.data as Post}
                          user={nameVal}
                        />
                      );
                    } else {
                      return (
                        <JobPostingCard
                          key={`job-${item.data.id}`}
                          job={item.data as GlobalJob}
                          onApply={handleJobApply}
                        />
                      );
                    }
                  })
                ) : (
                  <p className="text-gray-500">No posts or opportunities yet</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Trending Section */}
          </div>
        </div>
      </section>
    </main>
  );
}
