"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import SubBar from "@/components/subBar";
import {
  fetchFromBackend,
  postFetchFromBackend,
  deleteglobaljobposting,
  putglobaljobposting,
} from "@/lib/tools";
import { getAuthToken, fetchMe } from "@/lib/strapi/auth";

// Define types for the job data
interface JobData {
  id?: string;
  documentId?: string;
  title: string;
  jobType: string;
  experience: string;
  location: string;
  description: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  status: string;
  applicants?: number;
  postedDate?: string;
  deadline?: string;
}

export default function JobPostingsPage() {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Job posted successfully!");
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: "",
    jobTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string>("");

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // const user = await fetchMe();
        // const test = getEmployerProfile(user.employer_profile);
        const res = await fetchFromBackend(
          "employer-profiles/snc25a7at88l2rb59r924wg1?populate=*"
        );
        const sortedJobs = sortJobsByIdDesc(res.globaljobpostings || []);
        setJobs(sortedJobs);
        // setJobs(res.globaljobpostings || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Helper function to sort jobs by decreasing ID
  const sortJobsByIdDesc = (jobsArray: Array<Record<string, unknown>>) => {
    return jobsArray.sort((a, b) => {
      const aId = Number(a.id) || 0;
      const bId = Number(b.id) || 0;
      return bId - aId; // Descending order (newest first)
    });
  };

  //FORM DATA
  const [formData, setFormData] = useState({
    title: "",
    jobType: "Full Time",
    experience: "Entry Level",
    location: "",
    deadline: "",
    description: "",
    skills: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newReq, setNewReq] = useState("");
  const [newBen, setNewBen] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.title.trim().length < 5)
      newErrors.title = "Job title must be at least 5 characters";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.description.trim().length < 50)
      newErrors.description = "Job description must be at least 50 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //WRITE PAYLOAD
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Your Strapi collection only has ONE field called 'data' which is JSON YUUUHH THAS THE POINT

    //every payload has a data field, and that contains all the data of fields you made...
    //Here data is a json field you made..your just dumping some data in it
    const payload = {
      data: {
        data: {
          // This goes into your JSON field
          title: formData.title,
          jobType: formData.jobType,
          experience: formData.experience,
          location: formData.location,
          deadline: formData.deadline || null,
          description: formData.description,
          skills: formData.skills,
          requirements: formData.requirements,
          benefits: formData.benefits,
          status: "Active",
        },
      },
    };

    console.log(" Sending to JSON field:", JSON.stringify(payload, null, 2));

    try {
      let result;

      if (isEditing) {
        // Use PUT request for editing existing job
        console.log("Updating job with ID:", editingJobId);
        result = await putglobaljobposting(editingJobId, payload);
        console.log("Job updated successfully:", result);
      } else {
        // Use POST request for creating new job
        result = await postFetchFromBackend("globaljobpostings", payload);
        console.log("Job posted successfully:", result);
      }

      // Success - close modal and show toast
      setOpen(false);
      setIsEditing(false);
      setEditingJobId("");
      setToastMessage(
        isEditing ? "Job updated successfully!" : "Job posted successfully!"
      );
      setShowToast(true);

      // Reset form data
      setFormData({
        title: "",
        jobType: "Full Time",
        experience: "Entry Level",
        location: "",
        deadline: "",
        description: "",
        skills: [],
        requirements: [],
        benefits: [],
      });

      // Refetch jobs to update the list
      const updatedRes = await fetchFromBackend("globaljobpostings?populate=*");
      const sortedUpdatedJobs = sortJobsByIdDesc(updatedRes || []);
      setJobs(sortedUpdatedJobs);
    } catch (error) {
      console.error(
        isEditing ? " Error updating job:" : " Error posting job:",
        error
      );
      alert(
        `Failed to ${isEditing ? "update" : "post"} job: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Delete confirmation handlers
  const handleDeleteClick = (jobId: string, jobTitle: string) => {
    console.log("handleDeleteClick called with:", { jobId, jobTitle });
    console.log("Setting deleteConfirm state...");
    setDeleteConfirm({
      isOpen: true,
      jobId,
      jobTitle,
    });
    console.log("deleteConfirm state should be updated");
  };

  const handleDeleteConfirm = async () => {
    console.log("handleDeleteConfirm called");
    console.log("deleteConfirm state:", deleteConfirm);

    if (!deleteConfirm.jobId) {
      console.log("No job ID found, aborting delete");
      return;
    }

    console.log("Starting delete process for job ID:", deleteConfirm.jobId);
    setIsDeleting(true);

    try {
      const result = await deleteglobaljobposting(deleteConfirm.jobId);
      console.log("Delete function returned:", result);

      console.log("Job deleted successfully");

      // Close confirmation dialog
      setDeleteConfirm({
        isOpen: false,
        jobId: "",
        jobTitle: "",
      });

      // Show success message
      setToastMessage("Job deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Refetch jobs to update the list
      const updatedRes = await fetchFromBackend("globaljobpostings?populate=*");
      const sortedUpdatedJobs = sortJobsByIdDesc(updatedRes || []);
      setJobs(sortedUpdatedJobs);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert(
        `Failed to delete job: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      isOpen: false,
      jobId: "",
      jobTitle: "",
    });
  };

  // Edit job handler
  const handleEditClick = (jobData: Record<string, unknown>) => {
    const job = jobData.data as JobData;
    const jobId = jobData.documentId as string;

    console.log("Edit clicked for job:", job.title, "ID:", jobId);

    // Set editing state
    setIsEditing(true);
    setEditingJobId(String(jobId));

    // Pre-fill form with existing job data
    setFormData({
      title: job.title || "",
      jobType: job.jobType || "Full Time",
      experience: job.experience || "Entry Level",
      location: job.location || "",
      deadline: job.deadline || "",
      description: job.description || "",
      skills: Array.isArray(job.skills) ? job.skills : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
    });

    // Open the modal
    setOpen(true);
  };

  // Helper function to close modal and reset editing state
  const closeModal = () => {
    setOpen(false);
    setIsEditing(false);
    setEditingJobId("");
    setErrors({});
  };

  const addItem = (
    field: "skills" | "requirements" | "benefits",
    value: string
  ) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    if (field === "skills") setNewSkill("");
    if (field === "requirements") setNewReq("");
    if (field === "benefits") setNewBen("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SubBar
          items={[
            { url: "/employers/overview", name: "Overview", logo: "👤" },
            {
              url: "/employers/applications",
              name: "Applications",
              logo: "📈",
            },
            {
              url: "/employers/partnerships",
              name: "College Partnerships",
              logo: "🎓",
            },
            { url: "/employers/jobpostings", name: "Job Postings", logo: "🧳" },
            // { url: "/employers/analytics", name: "Analytics", logo: "📊" },
          ]}
          className="mb-10"
        />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Your Job Postings</h1>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingJobId("");
                setFormData({
                  title: "",
                  jobType: "Full Time",
                  experience: "Entry Level",
                  location: "",
                  deadline: "",
                  description: "",
                  skills: [],
                  requirements: [],
                  benefits: [],
                });
                setOpen(true);
              }}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              +<span>Post New Job</span>
            </button>
          </div>

          {/* Job Listings */}
          <div className="grid gap-4 sm:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((x: Record<string, unknown>) => {
                //x contains id
                const job = x.data as JobData;
                return (
                  <div
                    key={job.id}
                    className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Header Section */}
                    <div className="flex flex-col space-y-3 mb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {job.title}
                          </h3>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            job.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <span className="bg-gray-50 px-2 py-1 rounded">
                          {job.jobType}
                        </span>
                        <span className="bg-gray-50 px-2 py-1 rounded">
                          {job.experience}
                        </span>
                        <span className="bg-gray-50 px-2 py-1 rounded truncate max-w-[200px]">
                          {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills
                          .slice(0, 4)
                          .map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs font-medium border">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="font-medium">
                            {job.applicants || 0} applicants
                          </span>
                          <span>
                            Posted{" "}
                            {new Date(
                              job.postedDate || Date.now()
                            ).toLocaleDateString()}
                          </span>
                          {job.deadline && (
                            <span className="text-orange-600">
                              Due {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-5">
                          {/* <button className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors'>
                          View
                        </button> */}
                          <button
                            onClick={() => handleEditClick(x)}
                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              const jobId = x.documentId || x.id;
                              console.log("Delete button clicked:");
                              console.log("Raw x.documentId:", x.documentId);
                              console.log("Raw x.id:", x.id);
                              console.log("Using jobId:", jobId);
                              console.log("Job data x:", x);
                              console.log("Job data job:", job);
                              console.log("Job title:", job.title);
                              handleDeleteClick(String(jobId), job.title);
                            }}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            onMouseEnter={() =>
                              console.log(
                                "DocumentId:",
                                x.documentId,
                                "Id:",
                                x.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No job postings found
                </h3>
                <p className="text-gray-600">
                  Create your first job posting to get started.
                </p>
              </div>
            )}
          </div>

          {/* Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl sm:text-base"
                  onClick={closeModal}
                >
                  ✕
                </button>
                <h2 className="text-lg sm:text-xl font-semibold mb-1 pr-8">
                  {isEditing ? "Edit Job" : "Post a New Job"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  {isEditing
                    ? "Update the job details below."
                    : "Fill out the details below to post a new job opening."}
                </p>

                {/* Job Title */}
                <div className="mb-4">
                  <label className="text-xs sm:text-sm font-medium">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="mt-1 w-full border rounded-md p-2 text-sm"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Job Type / Experience */}
                {/* Job Type / Experience */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-xs sm:text-sm font-medium">
                      Job Type
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md p-2 text-sm"
                      value={formData.jobType}
                      onChange={(e) =>
                        setFormData({ ...formData, jobType: e.target.value })
                      }
                    >
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs sm:text-sm font-medium">
                      Experience Level
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md p-2 text-sm"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                    >
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                    </select>
                  </div>
                </div>

                {/* Location / Deadline */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-xs sm:text-sm font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., San Francisco, CA or Remote"
                      className="mt-1 w-full border rounded-md p-2 text-sm"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs sm:text-sm font-medium">
                      Application Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full border rounded-md p-2 text-sm"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-4">
                  <label className="text-xs sm:text-sm font-medium">
                    Job Description
                  </label>
                  <textarea
                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    className="mt-1 w-full border rounded-md p-2 h-20 sm:h-24 text-sm"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <label className="text-sm font-medium">
                    Skills Required (Optional)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      className="flex-1 border rounded-md p-2"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                    />
                    <button
                      onClick={() => addItem("skills", newSkill)}
                      className="px-3 py-2 border rounded-md hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 px-2 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-4">
                  <label className="text-sm font-medium">
                    Requirements (Optional)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add a requirement..."
                      className="flex-1 border rounded-md p-2"
                      value={newReq}
                      onChange={(e) => setNewReq(e.target.value)}
                    />
                    <button
                      onClick={() => addItem("requirements", newReq)}
                      className="px-3 py-2 border rounded-md hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 px-2 py-1 rounded text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <label className="text-sm font-medium">
                    Benefits (Optional)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add a benefit..."
                      className="flex-1 border rounded-md p-2"
                      value={newBen}
                      onChange={(e) => setNewBen(e.target.value)}
                    />
                    <button
                      onClick={() => addItem("benefits", newBen)}
                      className="px-3 py-2 border rounded-md hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.benefits.map((ben, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 px-2 py-1 rounded text-sm"
                      >
                        {ben}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm order-2 sm:order-1"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm order-1 sm:order-2"
                  >
                    {isEditing ? "Update Job" : "Post Job"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Job Posting
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete &quot;
                    {deleteConfirm.jobTitle}&quot;? This action cannot be
                    undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleDeleteCancel}
                      disabled={isDeleting}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log("Delete confirmation button clicked");
                        handleDeleteConfirm();
                      }}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[100px]"
                    >
                      {isDeleting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-md shadow-md">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
