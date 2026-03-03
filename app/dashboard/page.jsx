'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRooms: 0,
    myBookings: 0,
    upcomingBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch(`/api/bookings?userId=${session.user.id}`)
      ])

      const rooms = await roomsRes.json()
      const bookings = await bookingsRes.json()

      const now = new Date()
      const upcoming = bookings.filter(
        b => b.status === 'CONFIRMED' && new Date(b.startTime) > now
      )

      setStats({
        totalRooms: rooms.length,
        myBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
        upcomingBookings: upcoming.length,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6 text-gray-700">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your meeting room bookings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Available Rooms</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalRooms}</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-600">My Bookings</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.myBookings}</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Upcoming</h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.upcomingBookings}</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/rooms">
              <Button className="w-full">Browse Rooms</Button>
            </Link>
            <Link href="/dashboard/bookings">
              <Button variant="secondary" className="w-full mt-6 p-3">View My Bookings</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Browse available meeting rooms</li>
            <li>✓ Book a room for your meeting</li>
            <li>✓ View and manage your bookings</li>
            <li>✓ Check employee directory</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}