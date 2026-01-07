'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import React from 'react'

type Props = {
  title?: string
  theme?: 'white' | 'black' | 'home'
  user?: User | null
}

type User = {
  username: string
  abbreviation: string
  userType: 'student' | 'college' | 'employer'
  loggedIn: boolean
}

const DASHBOARD_ROUTES: Record<User['userType'], string> = {
  student: '/students',
  college: '/colleges/dashboard',
  employer: '/employers/overview',
}

export default function TopBar({
  title = 'FOOMO',
  theme = 'white',
  user = null,
}: Props) {
  // TODO: replace with real auth context/state
  const mockUser = user
  const isAuthenticated = Boolean(mockUser?.loggedIn)
  const authenticatedUser: User | null =
    isAuthenticated && mockUser ? mockUser : null

  const isHomeTheme = theme === 'home'
  const navbarClasses = isHomeTheme ? '' : 'backdrop-blur-md'
  const backgroundStyle = isHomeTheme
    ? {
        backgroundColor: '#000',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }
    : {
        background:
          'linear-gradient(rgba(255,255,255,0.50), rgba(255,255,255,0.50))',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }

  const greetingColor = theme === 'black' ? 'text-gray-900' : 'text-white'

  return (
    <div
      role='banner'
      className={`fixed inset-x-0 top-0 z-50 ${navbarClasses}`}
      style={backgroundStyle}
    >
      <div className='mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo and Title */}
        <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
          <div className='flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-lg bg-[#d6ff3a] text-lg sm:text-xl font-extrabold text-[#082926] shadow-[0_3px_0_rgba(0,0,0,0.12)]'>
            F
          </div>
          <Link href='/'>
            <span
              className={`${
                theme === 'black' ? 'text-black' : 'text-white'
              } text-lg sm:text-2xl lg:text-3xl font-semibold truncate`}
            >
              {title}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className='flex items-center' aria-label='Primary'>
          {!authenticatedUser ? (
            <div className='flex items-center gap-2 sm:gap-3'>
              <a
                className='transform rounded-lg sm:rounded-2xl bg-[#d6ff3a] px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-bold sm:font-extrabold text-[#082926] shadow-[0_3px_0_rgba(0,0,0,0.12)] sm:shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.12)] sm:hover:shadow-[0_10px_0_rgba(0,0,0,0.12)]'
                href='/auth/login'
              >
                Login
              </a>
              <a
                className='transform rounded-lg sm:rounded-2xl bg-[#d6ff3a] px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-bold sm:font-extrabold text-[#082926] shadow-[0_3px_0_rgba(0,0,0,0.12)] sm:shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.12)] sm:hover:shadow-[0_10px_0_rgba(0,0,0,0.12)]'
                href='/auth/signup'
              >
                Sign Up
              </a>
            </div>
          ) : (
            <div className='flex items-center gap-2 sm:gap-4'>
              {/* User Greeting - Hidden on very small screens, visible on larger */}
              <span
                className={`hidden sm:block rounded-lg sm:rounded-2xl px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium ${greetingColor}`}
              >
                Hi {authenticatedUser.username}!
              </span>

              {/* User Avatar - Visible on small screens instead of greeting */}
              <span className='flex sm:hidden h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs font-semibold text-white'>
                {authenticatedUser.abbreviation}
              </span>

              <a
                className='transform rounded-lg sm:rounded-2xl bg-[#d6ff3a] px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-bold sm:font-extrabold text-[#082926] shadow-[0_3px_0_rgba(0,0,0,0.12)] sm:shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.12)] sm:hover:shadow-[0_10px_0_rgba(0,0,0,0.12)]'
                href={DASHBOARD_ROUTES[authenticatedUser.userType]}
              >
                Dashboard
              </a>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
