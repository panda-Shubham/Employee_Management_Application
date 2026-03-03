import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// app/api/users/route.js
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Admins see ALL users including inactive
    // Employees only see active users
    const query = session.user.role === 'ADMIN' ? {} : { isActive: true }

    const users = await User.find(query)
      .select('name email role department position isActive')
      .sort({ name: 1 })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}