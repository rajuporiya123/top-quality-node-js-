const mongoose = require('mongoose')

let orderSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentGatewayCharges: {
      type: Object,
    },
    // ticketId: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Ticket',
    //   },
    // ],
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
    },
    orderNumber: {
      type: String,
      default: '',
    },
    orderDate: {
      type: Date,
      default: Date.now(),
    },
    orderType: {
      type: String,
      enum: ['Free', 'Paid'],
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Refund',"WAITING-FOR-COMMITTEE-MEMBER-APPROVAL","Canceled"],
    },
    // attendees: [
    //   {
    //     name: String,
    //     email: String,
    //     countryCode: Number,
    //     phoneNumber: Number,
    //     barcode: String,
    //     paymentType: String,
    //     price: String,
    //     qty: Number,
    //     TicketName: String,
    //     ticketId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Ticket',
    //     },
    //   },
    // ],
    attendees: [{ type: Object }],
    totalAmount: {
      type: Number,
      default: 0,
    },
    refundDate: {
      type: Date,
      default: '',
    },
    refundStatus: {
      type: String,
      default: '',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    Payment:{
      type:Object
    },
    addonsDetails :[{type:Object}],
    appliedCouponId :{type : mongoose.Schema.Types.ObjectId},
    appliedCouponQty :{type : Number}
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
