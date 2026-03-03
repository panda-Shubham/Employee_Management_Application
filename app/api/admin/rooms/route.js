import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'

export async function POST(req) {
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

    // 4. Validation
    if (!body.name || !body.capacity) {
      return NextResponse.json(
        { error: 'Name and capacity are required' },
        { status: 400 }
      )
    }

    if (isNaN(body.capacity) || body.capacity < 1) {
      return NextResponse.json(
        { error: 'Capacity must be a number greater than 0' },
        { status: 400 }
      )
    }

    // 5. Check for duplicate room name
    const existing = await Room.findOne({ name: body.name.trim() })
    if (existing) {
      return NextResponse.json(
        { error: 'A room with this name already exists' },
        { status: 400 }
      )
    }

    // 6. Create room
    const room = await Room.create({
      name:        body.name.trim(),
      capacity:    Number(body.capacity),
      floor:       body.floor?.trim() || '',
      amenities:   Array.isArray(body.amenities) ? body.amenities : [],
      isAvailable: true,
    })

    return NextResponse.json(room, { status: 201 })

  } catch (error) {
    console.error('Room creation error:', error)

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A room with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
