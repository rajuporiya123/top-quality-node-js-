const mongoose = require('mongoose')

let orderFormSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      default: '',
      enum: ['TextField', 'SingleDropdown', 'MultipleDropdown', 'Date'],
    },
    fieldName: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    listDetails: {
      type: [String],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('OrderForm', orderFormSchema)
