const mongoose = require('mongoose')

let eventSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        default: [],
      },
    ],
    lat: {
      type: String,
      default: '',
    },
    lng: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default:'',
    },
    name: {
      type: String,
      default: '',
    },
    toBeAnnounced: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: '',
    },
    startTime: {
      type: String,
      default: '',
    },
    endDate: {
      type: Date,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    displayStartTime: {
      type: Boolean,
      default: false,
    },
    displayEndTime: {
      type: Boolean,
      default: false,
    },
    timeZone: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: 'gAQk53v3hzmtlewZLjFaPHTWjBwunAH8.png',
    },
    summary: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    eventFrequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly', ''],
      default: '',
    },
    eventDay: {
      type: String,
      default: '',
    },
    eventMonth: {
      type: String,
      default: '',
    },
    eventYear: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Live', 'Past', 'Draft','Pending'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    displayRemainingTickets: {
      type: Boolean,
      default: false,
    },
    ticketEvent: {
      type: String,
      enum: ['ticket_event', 'registrationEvent'],
    },
    admissionLabel: {
      type: String,
      default: '',
    },
    addonLabel: {
      type: String,
      default: '',
    },
    messageAfterTicketSalesEnd: {
      type: String,
      default: '',
    },
    publishEvent: {
      type: String,
      enum: ['Publish Now', 'Schedule for later'],
    },
    publishStartDate: {
      type: Date,
      default: '',
    },
    publishStartTime: {
      type: String,
      default: '',
    },
    eventType: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    // to be announced for event date and time announcedEvent
    toBeAnnouncedDate: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: '',
    },
    isCommitteeMember: {
      type: Boolean,
      default: false,
    },
    userStaffId: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    slug: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('event', eventSchema)
