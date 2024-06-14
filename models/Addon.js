const mongoose = require('mongoose')

let addonSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  detailsForConfirmationEmail: {
    type: String,
    default: '',
  },
  absorbFees: {
    type: Boolean,
    default: false,
  },
  minimumQuantity: {
    type: Number,
    default: 0,
  },
  maximumQuantity: {
    type: Number,
    default: 0,
  },
  salesStart: {
    type: String,
    default: '',
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
  visibility: {
    type: String,
    default: '',
  },
  salesChannel: {
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
  ticketSaleType: {
    type: String,
    default: '',
  },
  ticketOption: {
    type: String,
    default: '',
  },
  isVariation: {
    type: Boolean,
    default: false,
  },
  soldUnits: {
    type: Number,
    default: 0,
  },
  variations: [
    {
      variationName: {
        type: String,
        default: '',
      },
      variationQuantity: {
        type: Number,
        default: 0,
      },
      price: {
        type: String,
        default: '',
      },
      absorbFees: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        default: '',
      },
      soldUnits: {
        type: Number,
        default: 0,
      },
      image: {
        type: String,
        default: '',
      },
      detailsForConfirmationEmail: {
        type: String,
        default: '',
      },
      minimumQuantity: {
        type: Number,
        default: 0,
      },
      maximumQuantity: {
        type: Number,
        default: 0,
      },
      salesStart: {
        type: String,
        default: '',
      },
      ticketSaleType: {
        type: String,
        default: '',
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
      visibility: {
        type: String,
        default: '',
      },
      salesChannel: {
        type: String,
        default: '',
      },
      ticketOption: {
        type: String,
        default: '',
      },
    },
  ],
})

module.exports = mongoose.model('addon', addonSchema)
