'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/Button'
import { Calendar, Home, Users, BookOpen, Menu, X, Shield, Settings, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  // Regular user navigation
  // components/Navigation.jsx
  const employeeNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/rooms', label: 'Rooms', icon: Calendar },        // ← Added /dashboard
    { href: '/dashboard/bookings', label: 'My Bookings', icon: BookOpen }, // ← Added /dashboard
    { href: '/dashboard/directory', label: 'Directory', icon: Users },    // ← Added /dashboard
  ]

  // Admin-only navigation
  const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/all-bookings', label: 'All Bookings', icon: BookOpen },
  { href: '/admin/rooms', label: 'Manage Rooms', icon: Calendar },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  ]

  const navItems = isAdmin ? adminNavItems : employeeNavItems

  const isActive = (href) => pathname === href

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meeting Rooms
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive(item.href)
                      ? isAdmin 
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {session?.user?.name}
              </p>
              {isAdmin && (
                <div className="flex items-center space-x-1 text-xs text-purple-600">
                  <Shield className="h-3 w-3" />
                  <span>Administrator</span>
                </div>
              )}
            </div>
            <Button 
              variant="secondary" 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive(item.href)
                        ? isAdmin
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="px-4 mb-3">
                <p className="font-semibold text-gray-800">{session?.user?.name}</p>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
                {isAdmin && (
                  <div className="flex items-center space-x-1 text-sm text-purple-600 mt-1">
                    <Shield className="h-4 w-4" />
                    <span>Administrator</span>
                  </div>
                )}
              </div>
              <Button 
                variant="danger" 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full mx-4"
                style={{ width: 'calc(100% - 2rem)' }}
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}