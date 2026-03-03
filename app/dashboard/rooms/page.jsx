'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users } from 'lucide-react'

export default function RoomsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchRooms()
    }
  }, [session])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookRoom = (room) => {
    setSelectedRoom(room)
    setShowBookingForm(true)
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meeting Rooms</h1>
        <p className="text-gray-600 mt-2">Browse and book available meeting rooms</p>
      </div>

      {showBookingForm ? (
        <BookingForm
          room={selectedRoom}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedRoom(null)
          }}
          onSuccess={() => {
            setShowBookingForm(false)
            setSelectedRoom(null)
            router.push('/dashboard/bookings')
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room._id} className="hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">{room.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Capacity: {room.capacity} people</span>
                </div>
                
                {room.floor && (
                  <div className="text-gray-600">📍 {room.floor}</div>
                )}

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleBookRoom(room)}
              >
                Book This Room
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function BookingForm({ room, onClose, onSuccess }) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roomId: room._id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create booking')
        setLoading(false)
        return
      }

      onSuccess()
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl text-gray-700 mx-auto">
      <h2 className="text-2xl font-bold mb-6">Book {room.name}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Meeting Title *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid text-gray-700 grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time *</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time *</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 text-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </Card>
  )
}