'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { Search } from 'lucide-react'

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    let filtered = bookings

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }

    if (search) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.room?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.organizer?.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }, [search, filterStatus, bookings])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
      setFilteredBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">All Bookings</h1>
        <p className="text-gray-600 mt-2">Manage all meeting room bookings</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by title, room, or organizer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'ALL'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('CONFIRMED')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'CONFIRMED'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No bookings found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{booking.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {booking.description && (
                    <p className="text-gray-600 mb-3">{booking.description}</p>
                  )}

                  <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>📍 Room: {booking.room?.name}</div>
                    <div>👤 Organizer: {booking.organizer?.name}</div>
                    <div>
                      🕐 {format(new Date(booking.startTime), 'PPP p')}
                    </div>
                  </div>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <Button 
                    variant="danger" 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="ml-4"
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