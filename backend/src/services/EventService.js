/**
 * Event Service
 * Handles community events and registrations
 */
import Event from '../models/Event.js'
import { emitToTopic } from '../config/socket.js'

class EventService {
  /**
   * Create an event
   */
  async createEvent(organizerId, eventData) {
    const event = await Event.create({
      ...eventData,
      organizer: organizerId
    })

    await event.populate('organizer', 'firstName lastName avatar')

    // Notify subscribers
    try {
      if (event.status === 'published') {
        emitToTopic(`events:${event.category}`, 'new_event', {
          id: event._id,
          title: event.title,
          startDate: event.startDate,
          location: event.location.name
        })
      }
    } catch (e) {
      console.log('Socket not initialized')
    }

    return event
  }

  /**
   * Get events with filters
   */
  async getEvents(filters = {}, options = {}) {
    const {
      category,
      status = 'published',
      startDate,
      endDate,
      organizer,
      search,
      isOfficial,
      upcoming = true
    } = filters

    const { page = 1, limit = 20, sort = 'startDate' } = options

    const query = {}

    if (category) query.category = category
    if (status) query.status = status
    if (organizer) query.organizer = organizer
    if (isOfficial !== undefined) query.isOfficial = isOfficial

    if (search) {
      query.$text = { $search: search }
    }

    // Date filtering
    if (upcoming) {
      query.startDate = { $gte: new Date() }
    } else {
      if (startDate || endDate) {
        query.startDate = {}
        if (startDate) query.startDate.$gte = new Date(startDate)
        if (endDate) query.startDate.$lte = new Date(endDate)
      }
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName avatar role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)

    const total = await Event.countDocuments(query)

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get single event
   */
  async getEventById(eventId) {
    const event = await Event.findById(eventId)
      .populate('organizer', 'firstName lastName avatar role')
      .populate('attendees.user', 'firstName lastName avatar')

    if (!event) {
      throw new Error('Event not found')
    }

    return event
  }

  /**
   * Update event
   */
  async updateEvent(eventId, organizerId, updates, isAdmin = false) {
    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.organizer.toString() !== organizerId && !isAdmin) {
      throw new Error('Not authorized to update this event')
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'startDate', 'endDate',
      'allDay', 'location', 'images', 'capacity', 'registrationRequired',
      'registrationDeadline', 'status', 'tags', 'cost', 'contactInfo'
    ]

    if (isAdmin) {
      allowedUpdates.push('isOfficial')
    }

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        event[key] = updates[key]
      }
    }

    await event.save()
    await event.populate('organizer', 'firstName lastName avatar')

    return event
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId, userId, isAdmin = false) {
    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.organizer.toString() !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this event')
    }

    await Event.findByIdAndDelete(eventId)

    return { message: 'Event deleted successfully' }
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId, userId) {
    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.status !== 'published') {
      throw new Error('Event is not available for registration')
    }

    // Check if already registered
    const existingRegistration = event.attendees.find(
      a => a.user.toString() === userId && a.status !== 'cancelled'
    )

    if (existingRegistration) {
      throw new Error('Already registered for this event')
    }

    // Check capacity
    if (event.isFull) {
      throw new Error('Event is at full capacity')
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Registration deadline has passed')
    }

    event.attendees.push({
      user: userId,
      status: 'registered',
      registeredAt: new Date()
    })

    await event.save()

    return { message: 'Successfully registered for event' }
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(eventId, userId) {
    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    const attendee = event.attendees.find(a => a.user.toString() === userId)

    if (!attendee) {
      throw new Error('Not registered for this event')
    }

    attendee.status = 'cancelled'
    await event.save()

    return { message: 'Registration cancelled' }
  }

  /**
   * Get user's registered events
   */
  async getUserEvents(userId, options = {}) {
    const { page = 1, limit = 20, status = 'registered' } = options

    const events = await Event.find({
      'attendees.user': userId,
      'attendees.status': status
    })
      .populate('organizer', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('startDate')

    const total = await Event.countDocuments({
      'attendees.user': userId,
      'attendees.status': status
    })

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get events near location
   */
  async getEventsNearLocation(coordinates, maxDistance = 10000, limit = 20) {
    const events = await Event.find({
      status: 'published',
      startDate: { $gte: new Date() },
      'location.coordinates.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance
        }
      }
    })
      .populate('organizer', 'firstName lastName')
      .limit(limit)

    return events
  }
}

export default new EventService()
