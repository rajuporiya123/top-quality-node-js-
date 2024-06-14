const mongoose = require('mongoose')

let TicketSellSchema = new mongoose.Schema(
  {
    paymentType: {
      type: String,
      enum: ['Paid', 'Free'],
    },
    buyerName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    price: {
      type: String,
      default: '',
    },
    cash: {
      type: Boolean,
      default: false,
    },
    atTheDoorstep: {
      type: Boolean,
      default: false,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    checkIn: {
      type: Boolean,
      default: false,
    },
    ticketNumber: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ticketsell', TicketSellSchema)
