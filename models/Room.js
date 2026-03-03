import mongoose from 'mongoose'

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  floor: String,
  amenities: [String],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Room || mongoose.model('Room', RoomSchema)