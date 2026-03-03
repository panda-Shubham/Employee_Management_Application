import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'
import Booking from '@/models/Booking'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()
    const room = await Room.findByIdAndUpdate(params.id, body, { new: true })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Room update error:', error)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectDB()

    // Check for future bookings
    const futureBookings = await Booking.countDocuments({
      room: params.id,
      startTime: { $gte: new Date() },
      status: 'CONFIRMED',
    })

    if (futureBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with future bookings' },
        { status: 400 }
      )
    }

    const room = await Room.findByIdAndDelete(params.id)

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Room deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}