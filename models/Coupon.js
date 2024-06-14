const mongoose = require('mongoose')

let couponSchema = new mongoose.Schema(
  {
    codeName: {
      type: String,
      default: '',
    },
    ticketLimit: {
      type: String,
      default: '',
    },
    ticketLimitAmount: {
      type: Number,
      default: 0,
    },
    revealHiddenTickets: {
      type: Boolean,
      default: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountAmountPercentage: {
      type: Number,
      default: 0,
    },
    promoCodeStarts: {
      type: String,
      enum: ['Now', 'Scheduled time'],
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    startTime: {
      type: String,
      default: '',
    },
    promoCodeEnds: {
      type: String,
      enum: ['When ticket sales end', 'Scheduled time'],
    },
    expirationDate: {
      type: Date,
      default: Date.now(),
    },
    expirationTime: {
      type: String,
      default: '',
    },
    allVisibleTickets: {
      type: Boolean,
      default: false,
    },
    onlyCertainTickets: [
      {
        ticketId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ticket',
        },
        name: {
          type: String,
          default: '',
        },
        price: {
          type: String,
          default: 'Free',
        },
      },
    ],
    codeType: [
      {
        type: String,
        enum: [
          'Applies discount',
          'Reveals hidden tickets',
          'Unlocks specific seats',
        ],
      },
    ],
    numberOfCouponsUse: {
      type: Number,
      default: 0,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    codeUsedFor: {
      type: String,
      enum: ['Tickets', 'Addons', 'Both'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('coupon', couponSchema)
