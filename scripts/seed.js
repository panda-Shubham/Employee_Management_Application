const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  position: String,
  isActive: Boolean,
}, { timestamps: true })

const RoomSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  floor: String,
  amenities: [String],
  isAvailable: Boolean,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema)

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('📦 Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Room.deleteMany({})
    console.log('🧹 Cleared existing data')

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10)

    await User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'IT',
      position: 'Administrator',
      isActive: true,
    })

    await User.create({
      name: 'John Doe',
      email: 'john@company.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Engineering',
      position: 'Developer',
      isActive: true,
    })

    await User.create({
      name: 'Jane Smith',
      email: 'jane@company.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Marketing',
      position: 'Manager',
      isActive: true,
    })

    console.log('✅ Created 3 users')

    // Create 10 meeting rooms
    const rooms = []
    for (let i = 1; i <= 10; i++) {
      rooms.push({
        name: `Meeting Room ${i}`,
        capacity: [4, 6, 8, 10][Math.floor(Math.random() * 4)],
        floor: `Floor ${Math.ceil(i / 3)}`,
        amenities: ['Projector', 'Whiteboard', 'Video Conference'].slice(0, Math.floor(Math.random() * 3) + 1),
        isAvailable: true,
      })
    }

    await Room.insertMany(rooms)
    console.log('✅ Created 10 meeting rooms')

    console.log('\n🎉 Seed completed!')
    console.log('Login credentials:')
    console.log('Admin: admin@company.com / password123')
    console.log('Employee: john@company.com / password123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()