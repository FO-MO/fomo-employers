export const dynamic = 'force-dynamic'

import React from "react";
import { Briefcase, MapPin, Clock, Calendar, TrendingUp } from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  jobType: string;
  experience: string;
  location: string;
  deadline: string;
  description: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  status: string;
  companyName?: string;
  companyLogo?: string;
}

interface JobPostingCardProps {
  job: JobPosting;
  onApply?: (jobId: string) => void;
}

export default function JobPostingCard({ job, onApply }: JobPostingCardProps) {
  const isExpired = new Date(job.deadline) < new Date();
  const daysUntilDeadline = Math.ceil(
    (new Date(job.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {job.companyName ? job.companyName.charAt(0).toUpperCase() : "C"}
          </div>

          {/* Job Title and Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600">
              {job.companyName || "Company Name"}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            job.status === "Active" && !isExpired
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isExpired ? "Expired" : job.status}
        </span>
      </div>

      {/* Job Meta Info */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>{job.jobType}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>{job.experience}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Deadline:{" "}
            {new Date(job.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Deadline Warning */}
      {!isExpired && daysUntilDeadline <= 7 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800 font-medium">
            {daysUntilDeadline === 0
              ? "Deadline is today!"
              : daysUntilDeadline === 1
              ? "1 day left to apply"
              : `${daysUntilDeadline} days left to apply`}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Required Skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Requirements:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {job.requirements.slice(0, 3).map((req, idx) => (
              <li key={idx} className="line-clamp-1">
                {req}
              </li>
            ))}
            {job.requirements.length > 3 && (
              <li className="text-gray-500 italic">
                +{job.requirements.length - 3} more requirements
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Benefits:</p>
          <div className="flex flex-wrap gap-2">
            {job.benefits.slice(0, 3).map((benefit, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md"
              >
                {benefit}
              </span>
            ))}
            {job.benefits.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                +{job.benefits.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => onApply?.(job.id)}
          disabled={isExpired}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            isExpired
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isExpired ? "Application Closed" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}
