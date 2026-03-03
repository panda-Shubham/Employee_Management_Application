'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${session.user.id}`)
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const isPast = (endTime) => {
    return new Date(endTime) < new Date()
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-10 text-gray-700">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your meeting room bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            You don't have any bookings yet.
          </p>
          <div className="text-center">
            <Button onClick={() => router.push('/dashboard/rooms')}>
              Book a Room
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8 text-gray-700">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold">{booking.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                    {isPast(booking.endTime) && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Past
                      </span>
                    )}
                  </div>

                  {booking.description && (
                    <p className="text-gray-600 mb-3">{booking.description}</p>
                  )}

                  <div className="space-y-1 text-sm text-gray-600">
                    <div>📍 Room: {booking.room?.name}</div>
                    <div>
                      🕐 {format(new Date(booking.startTime), 'PPP p')} 
                      {' → '}
                      {format(new Date(booking.endTime), 'p')}
                    </div>
                  </div>
                </div>

                {booking.status === 'CONFIRMED' && !isPast(booking.endTime) && (
                  <Button 
                    variant="danger" 
                    onClick={() => handleCancel(booking._id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}