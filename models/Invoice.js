const mongoose = require('mongoose')

let invoiceSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      default: '',
    },
    invoiceNumber: {
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
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    ticketSellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketSell',
    },
    invoiceDate: {
      type: Date,
      default: Date.now(),
    },
    price: {
      type: String,
      default: '',
    },
    type:{
      type: String,
      enum:["Online","Offline"],
      default:"Offline",
    },
    ticketsQuantity:{
      type:Number
    },
    addonQuantity:{
      type:Number
    },
    OnlinePrice:{
      type:Number
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Invoice', invoiceSchema)
