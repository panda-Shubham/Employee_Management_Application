import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'

export async function GET() {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Connect to database
    await connectDB()

    // 3. Build query based on role
    // ADMINS see ALL rooms (including unavailable)
    // EMPLOYEES only see available rooms
    const query = session.user.role === 'ADMIN' ? {} : { isAvailable: true }

    // 4. Fetch rooms
    const rooms = await Room.find(query).sort({ name: 1 })

    return NextResponse.json(rooms)

  } catch (error) {
    console.error('Rooms fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}