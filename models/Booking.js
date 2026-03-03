import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['CONFIRMED', 'CANCELLED'], 
    default: 'CONFIRMED' 
  },
}, { timestamps: true })

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)