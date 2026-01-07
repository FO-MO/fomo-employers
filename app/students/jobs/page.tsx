'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { FiMapPin, FiCalendar } from 'react-icons/fi'
import { fetchData } from '@/lib/strapi/strapiData'
import JobDetailsModal from '@/components/student-section/JobDetailsModal'

interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  postedDate: string
  description: string
  tags: string[]
  type: string
  jobType: string
  experience: string
  deadline: string | null
  skills: string[]
  requirements: string[]
  benefits: string[]
}

interface JobData {
  title: string
  jobType: string
  experience: string
  location: string
  deadline: string | null
  description: string
  skills: string[]
  requirements: string[]
  benefits: string[]
}

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('fomo_token')
        const data = (await fetchData(
          token,
          'collegejobpostings?populate=*'
        )) as {
          data?: Array<{
            id?: number
            data?: string // JSON string containing the job data
            createdAt?: string
            updatedAt?: string
          }>
        }

        console.log(data)
        const fetchedJobs: Job[] = (data.data || []).map((job) => {
          // Parse the JSON data field
          let jobData: Partial<JobData> = {}
          try {
            if (job.data) {
              // Check if data is already an object or a string
              if (typeof job.data === 'string') {
                // Remove any extra quotes or whitespace that might cause parsing issues
                const cleanedData = job.data.trim()
                if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
                  // Remove surrounding quotes if present
                  jobData = JSON.parse(cleanedData.slice(1, -1))
                } else {
                  jobData = JSON.parse(cleanedData)
                }
              } else if (typeof job.data === 'object') {
                jobData = job.data as JobData
              }
            }
          } catch (error) {
            console.error('Failed to parse job data:', error)
            console.error('Raw data:', job.data)
            jobData = {}
          }

          return {
            id: job.id || 0,
            title: jobData.title || 'Unknown Job',
            company: 'Company Name', // You might need to add this field to your data structure
            location: jobData.location || 'Unknown Location',
            postedDate: 'Recently', // You might need to add this field or calculate from createdAt
            description: jobData.description || 'No description',
            salary: 'Not specified', // Add salary field to your data structure if needed
            tags: jobData.skills || [],
            type: jobData.jobType || 'internship',
            jobType: jobData.jobType || 'Unknown',
            experience: jobData.experience || 'Not specified',
            deadline: jobData.deadline || null,
            skills: jobData.skills || [],
            requirements: jobData.requirements || [],
            benefits: jobData.benefits || [],
          }
        })

        // Sort jobs: active jobs first (by deadline if available), then expired jobs
        const sortedJobs = fetchedJobs.sort((a, b) => {
          const now = new Date()
          const aDeadline = a.deadline ? new Date(a.deadline) : null
          const bDeadline = b.deadline ? new Date(b.deadline) : null

          const aIsExpired = aDeadline && aDeadline < now
          const bIsExpired = bDeadline && bDeadline < now

          // If one is expired and the other isn't, non-expired comes first
          if (aIsExpired && !bIsExpired) return 1
          if (!aIsExpired && bIsExpired) return -1

          // If both are expired or both are active, sort by deadline
          if (aDeadline && bDeadline) {
            return bDeadline.getTime() - aDeadline.getTime() // Most recent deadline first
          }

          // Jobs without deadline come first among active jobs
          if (!aDeadline && bDeadline && !bIsExpired) return -1
          if (aDeadline && !bDeadline && !aIsExpired) return 1

          return 0
        })

        setJobs(sortedJobs)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  const handleApply = () => {
    alert(
      `Application submitted for ${selectedJob?.title} at ${selectedJob?.company}!`
    )
    handleCloseModal()
  }

  const isJobExpired = (job: Job) => {
    if (!job.deadline) return false
    return new Date(job.deadline) < new Date()
  }

  return (
    <div className='w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 bg-white min-h-screen'>
      <section className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-extrabold mb-6'>
          College Jobs{' '}
          {!loading && (
            <span className='text-gray-500 text-xl'>
              ({jobs.filter((job) => !isJobExpired(job)).length} active,{' '}
              {jobs.filter((job) => isJobExpired(job)).length} expired)
            </span>
          )}
        </h1>
        <div className='space-y-4'>
          {loading ? (
            <div className='text-center py-8'>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className='text-center py-8'>
              <p>No jobs available at the moment.</p>
            </div>
          ) : (
            jobs.map((job: Job) => {
              const isExpired = isJobExpired(job)
              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-4 sm:p-6 hover:shadow-md transition-shadow ${
                    isExpired
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                  onClick={() => !isExpired && handleJobClick(job)}
                >
                  {/* Desktop Layout */}
                  <div className='hidden sm:flex items-center justify-between'>
                    <div className='flex items-center gap-5 flex-1'>
                      <div className='bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineBuildingOffice2 className='text-3xl text-gray-400' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-xl font-semibold'>
                            {job.title}
                          </span>
                          {isExpired && (
                            <span className='bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                              EXPIRED
                            </span>
                          )}
                          <span className='text-gray-500 text-sm'>
                            {job.company}
                          </span>
                        </div>
                        <div className='flex items-center gap-4 text-gray-500 text-sm mb-2 flex-wrap'>
                          <span className='flex items-center gap-1'>
                            <FiMapPin /> {job.location}
                          </span>
                          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                            {job.jobType}
                          </span>
                          <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                            {job.experience}
                          </span>
                          {job.deadline && (
                            <span
                              className={`flex items-center gap-1 ${
                                isExpired
                                  ? 'text-red-600 font-semibold'
                                  : 'text-red-600'
                              }`}
                            >
                              <FiCalendar />
                              {isExpired
                                ? 'EXPIRED'
                                : `Deadline: ${job.deadline}`}
                            </span>
                          )}
                        </div>
                        <div className='mb-2 text-black line-clamp-2'>
                          {job.description}
                        </div>
                        <div className='flex gap-2 flex-wrap'>
                          {job.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className='bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium'
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`px-7 py-3 rounded-xl font-semibold text-lg transition-colors flex-shrink-0 ml-4 ${
                        isExpired
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-[#185c5a] hover:bg-[#134846] text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isExpired) handleJobClick(job)
                      }}
                      disabled={isExpired}
                    >
                      {isExpired ? 'Expired' : 'View Details'}
                    </button>
                  </div>

                  {/* Mobile Layout */}
                  <div className='sm:hidden'>
                    <div className='flex items-start gap-3 mb-3'>
                      <div className='bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineBuildingOffice2 className='text-2xl text-gray-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='text-lg font-semibold text-gray-900 truncate'>
                            {job.title}
                          </h3>
                          {isExpired && (
                            <span className='bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex-shrink-0'>
                              EXPIRED
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {job.company}
                        </p>
                        <div className='flex flex-col gap-1 text-xs text-gray-500 mb-2'>
                          <span className='flex items-center gap-1'>
                            <FiMapPin className='w-3 h-3' /> {job.location}
                          </span>
                          <div className='flex gap-1 flex-wrap'>
                            <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                              {job.jobType}
                            </span>
                            <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                              {job.experience}
                            </span>
                          </div>
                          {job.deadline && (
                            <span
                              className={`flex items-center gap-1 ${
                                isExpired
                                  ? 'text-red-600 font-semibold'
                                  : 'text-red-600'
                              }`}
                            >
                              <FiCalendar className='w-3 h-3' />
                              {isExpired
                                ? 'EXPIRED'
                                : `Deadline: ${job.deadline}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <p className='text-sm text-gray-700 line-clamp-2 mb-2'>
                        {job.description}
                      </p>
                      <div className='flex gap-1 flex-wrap'>
                        {job.skills.slice(0, 3).map((skill: string) => (
                          <span
                            key={skill}
                            className='bg-gray-100 text-gray-700 rounded-full px-2 py-1 text-xs font-medium'
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className='bg-gray-100 text-gray-700 rounded-full px-2 py-1 text-xs font-medium'>
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                        isExpired
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-[#185c5a] hover:bg-[#134846] text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isExpired) handleJobClick(job)
                      }}
                      disabled={isExpired}
                    >
                      {isExpired ? 'Expired' : 'View Details'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApply={handleApply}
        />
      </section>
    </div>
  )
}
