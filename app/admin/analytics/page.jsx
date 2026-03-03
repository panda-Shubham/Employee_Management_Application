// app/admin/analytics/page.jsx
// LIGHT THEME - matching employee dashboard style

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  CalendarDays,
  Users,
  DoorOpen,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, uRes, rRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/users'),
          fetch('/api/rooms'),
        ])
        const bookings = await bRes.json()
        const users    = await uRes.json()
        const rooms    = await rRes.json()

        const now        = new Date()
        const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
        const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7)

        const confirmed = bookings.filter(b => b.status === 'CONFIRMED')
        const cancelled = bookings.filter(b => b.status === 'CANCELLED')

        const roomUsage = rooms.map(room => ({
          name: room.name,
          count: confirmed.filter(b =>
            (b.room?._id ?? b.room)?.toString() === room._id.toString()
          ).length,
        })).sort((a, b) => b.count - a.count)

        setData({
          totalBookings:  bookings.length,
          confirmed:      confirmed.length,
          cancelled:      cancelled.length,
          cancelRate:     bookings.length ? Math.round((cancelled.length / bookings.length) * 100) : 0,
          totalUsers:     users.length,
          activeUsers:    users.filter(u => u.isActive).length,
          totalRooms:     rooms.length,
          todayBookings:  confirmed.filter(b => new Date(b.startTime) >= todayStart).length,
          weekBookings:   confirmed.filter(b => new Date(b.startTime) >= weekStart).length,
          upcoming:       confirmed.filter(b => new Date(b.startTime) > now).length,
          roomUsage,
          recent: [...bookings]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5),
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const maxRoomCount = data.roomUsage[0]?.count || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-gray-600 mt-2">Overview of all bookings and usage</p>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
          <p className="text-4xl font-bold text-violet-600 mt-2">{data.totalBookings}</p>
          <p className="text-sm text-gray-500 mt-1">{data.weekBookings} this week</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Active Users</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{data.activeUsers}</p>
          <p className="text-sm text-gray-500 mt-1">of {data.totalUsers} total</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Meeting Rooms</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{data.totalRooms}</p>
          <p className="text-sm text-gray-500 mt-1">available</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-600">Today's Meetings</h3>
          <p className="text-4xl font-bold text-orange-600 mt-2">{data.todayBookings}</p>
          <p className="text-sm text-gray-500 mt-1">{data.upcoming} upcoming</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Room Usage */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Room Utilization
          </h3>
          <div className="space-y-4">
            {data.roomUsage.length === 0 ? (
              <p className="text-gray-500 text-sm">No booking data yet</p>
            ) : (
              data.roomUsage.slice(0, 6).map((room, i) => {
                const pct = Math.round((room.count / maxRoomCount) * 100)
                const colors = [
                  'bg-violet-500', 'bg-blue-500', 'bg-green-500',
                  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
                ]
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 truncate pr-3">{room.name}</span>
                      <span className="text-gray-900 font-semibold">
                        {room.count} booking{room.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${pct || 2}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Booking Summary */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Booking Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">Confirmed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-semibold">{data.confirmed}</span>
                <span className="text-gray-500 text-sm">
                  {data.totalBookings ? Math.round((data.confirmed / data.totalBookings) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-700">Cancelled</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-semibold">{data.cancelled}</span>
                <span className="text-gray-500 text-sm">{data.cancelRate}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700">Upcoming</span>
              </div>
              <span className="text-gray-900 font-semibold">{data.upcoming}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-gray-700">This Week</span>
              </div>
              <span className="text-gray-900 font-semibold">{data.weekBookings}</span>
            </div>

            {/* Progress Bar */}
            <div className="pt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                {data.totalBookings > 0 && (
                  <>
                    <div className="h-full bg-green-500" style={{ width: `${100 - data.cancelRate}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${data.cancelRate}%` }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-600" />
          Recent Activity
        </h3>

        {data.recent.length === 0 ? (
          <p className="text-gray-500 py-4">No recent bookings</p>
        ) : (
          <div className="divide-y">
            {data.recent.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">{b.title}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {b.room?.name ?? 'Unknown room'} · {b.organizer?.name ?? 'Unknown'}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-gray-600 text-sm">
                      {b.startTime ? format(new Date(b.startTime), 'MMM d, h:mm a') : '—'}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    b.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {b.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
