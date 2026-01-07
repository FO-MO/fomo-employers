'use client'
export const dynamic = 'force-dynamic'

import { X } from 'lucide-react'
import { useState } from 'react'
import { getAuthToken } from '@/lib/strapi/auth'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://tbs9k5m4-1337.inc1.devtunnels.ms'

interface EditEmployerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentData: {
    name: string
    email: string
    phone?: string
    description?: string
    website?: string
    industry?: string
    location?: string
    noOfEmployers?: number
    specialties?: string
  }
  onSave: () => void
}

interface UserData {
  documentId?: string
  id?: string
}

interface EmployerProfilePayload {
  name: string
  phone: string
  description: string
  website: string
  industry: string
  location: string
  noOfEmployers: number
  specialties: string
}

export default function EditEmployerProfileModal({
  isOpen,
  onClose,
  currentData,
  onSave,
}: EditEmployerProfileModalProps) {
  const [name, setName] = useState(currentData.name)
  const [email] = useState(currentData.email)
  const [phone, setPhone] = useState(currentData.phone || '')
  const [description, setDescription] = useState(currentData.description || '')
  const [website, setWebsite] = useState(currentData.website || '')
  const [industry, setIndustry] = useState(currentData.industry || '')
  const [location, setLocation] = useState(currentData.location || '')
  const [noOfEmployers, setNoOfEmployers] = useState(
    currentData.noOfEmployers || 0
  )
  const [specialties, setSpecialties] = useState(currentData.specialties || '')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = getAuthToken()
      if (!token) {
        alert('You must be signed in to update your profile.')
        return
      }

      // Get employerId from stored user
      let employerId: string | null = null
      try {
        const raw = localStorage.getItem('fomo_user')
        if (raw) {
          const parsed: UserData = JSON.parse(raw as string)
          employerId = parsed?.documentId ?? parsed?.id ?? null
        }
      } catch {
        // ignore parse errors
      }

      // Check for existing profile
      let recordId: string | null = null
      if (employerId) {
        const q = `${BACKEND_URL}/api/Employer-profiles?filters[employerId][$eq]=${encodeURIComponent(
          employerId
        )}&populate=*`
        const res = await fetch(q, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          const rec = json?.data?.[0]
          recordId = rec?.documentId ?? null
        } else {
          console.warn('Failed to check existing profile', res.status)
        }
      }

      // Build payload for Strapi
      const payload: EmployerProfilePayload = {
        name,
        phone,
        description,
        website,
        industry,
        location,
        noOfEmployers: Number(noOfEmployers),
        specialties,
      }

      // If record exists, try update. If update returns 404, fallback to create.
      if (recordId) {
        console.log('Updating employer profile:', { data: payload })
        const updateRes = await fetch(
          `${BACKEND_URL}/api/employer-profiles/${recordId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: payload }),
          }
        )

        if (!updateRes.ok) {
          const body = await updateRes.text()
          console.warn('Update failed', updateRes.status, body)
          if (updateRes.status === 404) {
            // fallback to create
            const createRes = await fetch(
              `${BACKEND_URL}/api/employer-profiles`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ data: { ...payload, employerId } }),
              }
            )
            if (!createRes.ok) {
              console.error('Create fallback failed', await createRes.text())
              alert(
                'Failed to create profile after update failed. See console.'
              )
              return
            }
          } else {
            alert('Failed to update profile. See console for details.')
            return
          }
        }
      } else {
        // No record -> create
        console.log('Creating employer profile:', { data: payload })
        const createRes = await fetch(`${BACKEND_URL}/api/employer-profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { ...payload, employerId } }),
        })
        if (!createRes.ok) {
          console.error('Create failed', await createRes.text())
          alert('Failed to create profile. See console for details.')
          return
        }
      }

      // call parent onSave so UI updates locally
      onSave()
    } catch (err) {
      console.error('Failed to save profile', err)
      alert('Failed to save profile. See console for details.')
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide'
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Edit Company Profile
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='p-6 space-y-6'>
            {/* Company Name */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Company Name
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                placeholder='Enter your company name'
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Email
              </label>
              <input
                type='email'
                value={email}
                readOnly
                className='w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed'
                placeholder='Email'
              />
              <p className='text-xs text-gray-500 mt-2'>
                Email cannot be changed here. Contact support to update your
                email.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Phone Number
              </label>
              <input
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                placeholder='+1 (555) 123-4567'
              />
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Company Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none'
                placeholder='Tell us about your company...'
              />
            </div>

            {/* Website */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Website
              </label>
              <input
                type='url'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                placeholder='https://www.example.com'
              />
            </div>

            {/* Industry and Location */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Industry
                </label>
                <input
                  type='text'
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                  placeholder='e.g., Technology'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Number of Employees
                </label>
                <input
                  type='number'
                  value={noOfEmployers}
                  onChange={(e) => setNoOfEmployers(Number(e.target.value))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                  placeholder='e.g., 50'
                  min='0'
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Location
              </label>
              <input
                type='text'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900'
                placeholder='e.g., San Francisco, CA'
              />
            </div>

            {/* Specialties */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Specialties
              </label>
              <textarea
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                rows={3}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none'
                placeholder='Enter specialties separated by commas (e.g., Web Development, Cloud Computing, AI Solutions)'
              />
              <p className='text-xs text-gray-500 mt-2'>
                Separate multiple specialties with commas
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
