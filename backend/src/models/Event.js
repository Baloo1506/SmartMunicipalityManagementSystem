/**
 * Event Model
 * Handles community events and activities
 */
import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['community', 'sports', 'culture', 'education', 'health', 'government', 'environment', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: String,
    city: String,
    postalCode: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineUrl: String
  },
  images: [{
    url: String,
    caption: String
  }],
  capacity: {
    type: Number,
    default: null
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
    registeredAt: { type: Date, default: Date.now }
  }],
  isOfficial: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  cost: {
    isFree: { type: Boolean, default: true },
    amount: Number,
    currency: { type: String, default: 'EUR' }
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  recurrence: {
    isRecurring: { type: Boolean, default: false },
    pattern: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    endAfter: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
eventSchema.index({ 'location.coordinates.coordinates': '2dsphere' })
eventSchema.index({ startDate: 1, status: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ title: 'text', description: 'text', tags: 'text' })

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees?.filter(a => a.status !== 'cancelled').length || 0
})

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function () {
  if (!this.capacity) return false
  return this.attendeeCount >= this.capacity
})

// Validate end date is after start date
eventSchema.pre('validate', function (next) {
  if (this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date')
  }
  next()
})

const Event = mongoose.model('Event', eventSchema)
export default Event
