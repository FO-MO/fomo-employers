"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import ProjectCard, { Project } from "@/components/student-section/ProjectCard";
import CreateProjectModal from "@/components/student-section/CreateProjectModal";
import { fetchData } from "@/lib/strapi/strapiData";
import { getMediaUrl } from "@/lib/utils";

export default function StudentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { getAuthTokenCookie } = await import("@/lib/cookies");
        const token = getAuthTokenCookie();

        if (!token) {
          setError("Please log in to view projects");
          setProjects([]);
          setLoading(false);
          return;
        }

        const data = (await fetchData(token, "projects?populate=*")) as {
          data?: Array<{
            documentId?: string;
            title?: string;
            description?: string;
            author?: string;
            skills?: string[];
            no_member?: number;
            image?: { url?: string };
          }>;
        };

        if (!data || !data.data) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const mockProjects: Project[] = data.data.map((project) => {
          return {
            id: project.documentId || "unknown",
            title: project.title || "Untitled Project",
            description: project.description || "No description",
            tags: ["Project"],
            creator: {
              name: project.author || "Unknown Author",
              avatarUrl: null,
            },
            skills: project.skills || [],
            membersCount: project.no_member || 0,
            imageUrl: getMediaUrl(project.image?.url),
            actions: [{ label: "Join Project", href: "#" }],
          };
        });

        console.log("Fetched projects:", mockProjects);
        setProjects(mockProjects);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Failed to load projects. Please try again later.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    githubUrl: string;
    coverImageUrl?: string;
    skills: string[];
    tags: string[];
  }) => {
    // TODO: Implement API call to create project
    // Example:
    // const response = await fetch('/api/projects', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(projectData)
    // });
    // if (response.ok) {
    //   // Refresh projects list
    // }

    console.log("Create project data:", projectData);
    alert("Project created! (Connect to your API)");
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 bg-white min-h-screen">
      <section className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold">Projects</h1>
            <p className="text-gray-600 mt-2">
              Join or create projects to collaborate with other students
            </p>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#0f4f4a] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-[#0d3f3b] transition-colors"
            >
              <span className="text-2xl">+</span>
              <span>Create Project</span>
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Search input - full width on mobile */}
          <div className="w-full">
            <input
              className="w-full border rounded-lg px-4 py-3 text-base"
              placeholder="Search projects..."
            />
          </div>

          {/* Filters - stacked on mobile, side by side on larger screens */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="border rounded-lg px-4 py-3 text-base flex-1 sm:flex-initial">
              <option>Newest</option>
              <option>Oldest</option>
              <option>Most Popular</option>
            </select>

            <select className="border rounded-lg px-4 py-3 text-base flex-1 sm:flex-initial">
              <option>All Projects</option>
              <option>Web Development</option>
              <option>Mobile Apps</option>
              <option>AI/ML</option>
              <option>Game Development</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-center py-12">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              No projects available yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Be the first to create a project!
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreateProject={handleCreateProject}
          />
        )}
      </section>
    </div>
  );
}
