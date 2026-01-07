'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import OverviewCards1 from '@/components/employee-section/OverviewCards1'
import OverviewCards2 from '@/components/employee-section/OverviewCards2'
import OverviewCards3 from '@/components/employee-section/OverviewCards3'
import SubBar from '@/components/subBar'

export default function EmployeeOverview() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <SubBar
          items={[
            { url: '/employers/overview', name: 'Overview', logo: '👤' },
            {
              url: '/employers/applications',
              name: 'Applications',
              logo: '📈',
            },
            {
              url: '/employers/partnerships',
              name: 'College Partnerships',
              logo: '🎓',
            },
            { url: '/employers/jobpostings', name: 'Job Postings', logo: '🧳' },
            // { url: "/employers/analytics", name: "Analytics", logo: "📊" },
          ]}
          className='mb-10'
        />
        {/* Header Section */}
        <div className='mb-8 sm:mb-12'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
                  College Recommendations
                </h1>
              </div>
              <p className='text-sm sm:text-base text-gray-600 max-w-2xl'>
                Colleges that best match your hiring requirements and company
                profile
              </p>
            </div>
          </div>
        </div>

        {/* College Cards */}
        <OverviewCards1 />

        {/* Performance & Top Colleges Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          <OverviewCards2 />
          <OverviewCards3 />
        </div>
      </div>
    </div>
  )
}
