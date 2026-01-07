'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontal, X } from 'lucide-react'

type Item = {
  key: string
  label: string
  href?: string
  icon?: string
}

type Props = {
  active?: string
  className?: string
}

const items: Item[] = [
  { key: 'home', label: 'Home', href: '/students', icon: '/icons/home.svg' },
  {
    key: 'projects',
    label: 'Projects',
    href: '/students/projects',
    icon: '/icons/projects.svg',
  },
  {
    key: 'clubs',
    label: 'Clubs',
    href: '/students/clubs',
    icon: '/icons/Clubs.svg',
  },
  {
    key: 'jobs',
    label: 'Jobs',
    href: '/students/jobs',
    icon: '/icons/jobs.svg',
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/students/profile',
    icon: '/icons/Profile.svg',
  },
  // {
  //   key: "messages",
  //   label: "Messages",
  //   href: "/students/messages",
  //   icon: "/icons/messages.svg",
  // },
  {
    key: 'search',
    label: 'Search',
    href: '/students/search',
    icon: '/icons/search.svg',
  },
  {
    key: 'copilot',
    label: 'Ask FOOMO AI ',
    href: '/students/ai',
    icon: '/icons/ai.svg',
  },
]

export default function SideBar({ className = '' }: Omit<Props, 'active'>) {
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const getKeyFromPath = (p: string) => {
    if (!p) return 'home'

    // Handle root path
    if (p === '/' || p === '') return 'home'

    // Sort items by href length (descending) to match more specific routes first
    const sortedItems = [...items].sort((a, b) => {
      const lenA = a.href && a.href !== '#' ? a.href.length : 0
      const lenB = b.href && b.href !== '#' ? b.href.length : 0
      return lenB - lenA
    })

    // Try to match routes - check if path starts with or matches the href
    const match = sortedItems.find((it) => {
      if (!it.href || it.href === '#') return false
      // Exact match
      if (p === it.href) return true
      // Path starts with the href (for nested routes)
      if (p.startsWith(it.href + '/')) return true
      return false
    })

    if (match) return match.key
    return 'home'
  }

  const [current, setCurrent] = useState<string>(() => getKeyFromPath(pathname))

  // Update the active item when the pathname changes
  useEffect(() => {
    const newKey = getKeyFromPath(pathname)
    setCurrent(newKey)
    // Close mobile menu when route changes
    setShowMobileMenu(false)
  }, [pathname])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden sm:block fixed left-0 z-9 w-56 h-[calc(100vh-5rem)] ${className}`}
        aria-label='Sidebar'
      >
        <div className='h-full bg-[#192534] text-white min-h-screen p-6'>
          <div className='flex flex-col gap-3 mt-20'>
            {items.map((it) => {
              const isActive = it.key === current
              const isClickable = it.href && it.href !== '#'

              const content = (
                <>
                  <span className={`p-1 ${isActive ? 'bg-transparent' : ''}`}>
                    {it.icon && (
                      <Image
                        src={it.icon}
                        alt={it.label}
                        width={20}
                        height={20}
                        className='w-5 h-5'
                      />
                    )}
                  </span>
                  <span className='font-medium'>{it.label}</span>
                </>
              )

              const className = `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0f4f4a] to-[#0a6a60] text-white shadow-lg'
                  : 'text-white/90 hover:bg-white/3'
              }`

              if (isClickable) {
                return (
                  <Link key={it.key} href={it.href!} className={className}>
                    {content}
                  </Link>
                )
              }

              return (
                <button key={it.key} className={className} disabled>
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile only */}
      <nav
        className='sm:hidden fixed bottom-0 left-0 right-0 z-[51] bg-[#192534] border-t border-gray-700 px-2 py-1'
        style={{
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
          minHeight: '4rem', // Ensure consistent height
        }}
        aria-label='Navigation'
      >
        <div className='flex justify-around items-center max-w-md mx-auto'>
          {/* Show the first 4 navigation items */}
          {items.slice(0, 4).map((it) => {
            const isActive = it.key === current
            const isClickable = it.href && it.href !== '#'

            const mobileContent = (
              <div className='flex flex-col items-center justify-center min-h-[3rem] px-2'>
                {it.icon && (
                  <Image
                    src={it.icon}
                    alt={it.label}
                    width={18}
                    height={18}
                    className={`w-[18px] h-[18px] mb-1 transition-all duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'text-[#d6ff3a]' : 'text-white/70'
                  }`}
                >
                  {it.label}
                </span>
              </div>
            )

            const mobileClassName = `relative transition-all duration-200 rounded-lg ${
              isActive
                ? 'bg-gradient-to-t from-[#0f4f4a]/50 to-[#0a6a60]/30'
                : 'hover:bg-white/5'
            }`

            if (isClickable) {
              return (
                <Link key={it.key} href={it.href!} className={mobileClassName}>
                  {mobileContent}
                  {isActive && (
                    <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#d6ff3a] rounded-full'></div>
                  )}
                </Link>
              )
            }

            return (
              <button key={it.key} className={mobileClassName} disabled>
                {mobileContent}
              </button>
            )
          })}

          {/* More button for overflow menu */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`relative transition-all duration-200 rounded-lg ${
              showMobileMenu
                ? 'bg-gradient-to-t from-[#0f4f4a]/50 to-[#0a6a60]/30'
                : 'hover:bg-white/5'
            }`}
          >
            <div className='flex flex-col items-center justify-center min-h-[3rem] px-2'>
              {showMobileMenu ? (
                <X className='w-[18px] h-[18px] mb-1 text-white transition-all duration-200' />
              ) : (
                <MoreHorizontal className='w-[18px] h-[18px] mb-1 text-white transition-all duration-200' />
              )}
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  showMobileMenu ? 'text-[#d6ff3a]' : 'text-white/70'
                }`}
              >
                More
              </span>
            </div>
            {showMobileMenu && (
              <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#d6ff3a] rounded-full'></div>
            )}
          </button>
        </div>

        {/* Overflow Menu - Mobile only */}
        {showMobileMenu && (
          <div className='sm:hidden absolute bottom-full left-0 right-0 bg-[#192534] border-t border-gray-700 py-2 z-[52]'>
            <div className='flex flex-wrap justify-center gap-2 px-4 max-w-md mx-auto'>
              {items.slice(4).map((it) => {
                const isActive = it.key === current
                const isClickable = it.href && it.href !== '#'

                const overflowContent = (
                  <div className='flex items-center gap-3 px-3 py-2'>
                    {it.icon && (
                      <Image
                        src={it.icon}
                        alt={it.label}
                        width={16}
                        height={16}
                        className='w-4 h-4'
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-[#d6ff3a]' : 'text-white/90'
                      }`}
                    >
                      {it.label}
                    </span>
                  </div>
                )

                const overflowClassName = `rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0f4f4a]/50 to-[#0a6a60]/30'
                    : 'hover:bg-white/10'
                }`

                if (isClickable) {
                  return (
                    <Link
                      key={it.key}
                      href={it.href!}
                      className={overflowClassName}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {overflowContent}
                    </Link>
                  )
                }

                return (
                  <button key={it.key} className={overflowClassName} disabled>
                    {overflowContent}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Menu Backdrop - Mobile only when menu is open */}
      {showMobileMenu && (
        <div
          className='sm:hidden fixed inset-0 bg-black/20 z-[50]'
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  )
}
