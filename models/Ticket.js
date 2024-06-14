const mongoose = require('mongoose')

let ticketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ticketType: {
      type: String,
      enum: ['Paid', 'Free'],
    },
    ticketSaleType: {
      type: String,
      enum: ['On Sale', 'Scheduled', 'Ended'],
    },
    availableQuantity: {
      type: String,
      default: '',
    },
    price: {
      type: String,
      default: 'Free',
    },
    ticketOption: {
      type: String,
      default: '',
    },
    soldTicket: {
      type: Number,
      default: 0,
    },
    availableTickets: {
      type: String,
      default: '',
    },
    salesStart: {
      type: Date,
      default: '',
    },
    salesEnd: {
      type: Date,
      default: '',
    },
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    visibility: {
      type: String,
      default: '',
    },
    minimumQuantity: {
      type: String,
      default: '',
    },
    maximumQuantity: {
      type: String,
      default: '',
    },
    salesChannel: {
      type: String,
      default: '',
    },
    eTicket: {
      type: Boolean,
      default: false,
    },
    willCall: {
      type: Boolean,
      default: false,
    },
    wristBand: {
      type: Boolean,
      default: false,
    },
    paymentType: {
      type: String,
      default: 'Online',
      enum: ['Online', 'At The Doorstep', 'Cash'],
    },
    showTicketSaleEndDatesAndSaleStatusAtCheckout: {
      type: Boolean,
      default: false,
    },
    startShowingOn: {
      type: Date,
      default: '',
    },
    startShowingTime: {
      type: String,
      default: '',
    },
    stopShowingOn: {
      type: Date,
      default: '',
    },
    endShowingTime: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Ticket', ticketSchema)
