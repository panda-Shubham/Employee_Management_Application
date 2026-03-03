import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const query = userId ? { organizer: userId } : {}

    const bookings = await Booking.find(query)
      .populate('room')
      .populate('organizer', 'name email')
      .sort({ startTime: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { roomId, title, description, startTime, endTime } = await req.json()

    // Validation
    if (!roomId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    // Check for conflicts
    const conflicts = await Booking.find({
      room: roomId,
      status: 'CONFIRMED',
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    })

    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'This time slot is already booked. Please choose a different time.' 
      }, { status: 400 })
    }

    // Create booking
    const booking = await Booking.create({
      room: roomId,
      title,
      description,
      startTime: start,
      endTime: end,
      organizer: session.user.id,
      status: 'CONFIRMED',
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('organizer', 'name email')

    return NextResponse.json(populatedBooking, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}