import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'
import Booking from '@/models/Booking'

// ── PATCH: Edit room ──────────────────────────────────────────────────────────
export async function PATCH(req, { params }) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. Connect to database
    await connectDB()

    // 3. Parse request body
    const body = await req.json()
    const roomId = params.id

    // 4. Build update object
    const updateData = {}
    if (body.name     !== undefined) updateData.name     = body.name.trim()
    if (body.capacity !== undefined) {
      if (isNaN(body.capacity) || body.capacity < 1) {
        return NextResponse.json(
          { error: 'Capacity must be a number greater than 0' },
          { status: 400 }
        )
      }
      updateData.capacity = Number(body.capacity)
    }
    if (body.floor    !== undefined) updateData.floor    = body.floor.trim()
    if (body.amenities !== undefined) {
      updateData.amenities = Array.isArray(body.amenities) ? body.amenities : []
    }
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable

    // 5. Update room
    const room = await Room.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)

  } catch (error) {
    console.error('Room update error:', error)

    // Handle duplicate name error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A room with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// ── DELETE: Delete room ───────────────────────────────────────────────────────
export async function DELETE(req, { params }) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. Connect to database
    await connectDB()

    const roomId = params.id

    // 3. Check if room exists
    const room = await Room.findById(roomId)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // 4. Check for future bookings
    const futureBookings = await Booking.countDocuments({
      room:      roomId,
      status:    'CONFIRMED',
      startTime: { $gte: new Date() },
    })

    if (futureBookings > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${room.name}" — it has ${futureBookings} upcoming booking${futureBookings > 1 ? 's' : ''}. Cancel those bookings first.`,
        },
        { status: 400 }
      )
    }

    // 5. Delete room
    await Room.findByIdAndDelete(roomId)

    return NextResponse.json({ message: 'Room deleted successfully' })

  } catch (error) {
    console.error('Room deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}