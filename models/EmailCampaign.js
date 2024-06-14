const mongoose = require('mongoose')

let emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      default: '',
    },
    fromName: {
      type: String,
      default: '',
    },
    fromEmail: {
      type: String,
      default: '',
    },
    marketingGroupId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketingGroup',
      },
    ],
    recipients: [
      {
        type: String,
      },
    ],
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    emailTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate',
    },
    toMail: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: '',
    },
    html: {
      type: String,
      default: '',
    },
    mailTemplateDesign: {
      type: Object,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdTimestamp: {
      type: Date,
      default: () => new Date(),
    },
    campaignType: {
      type: String,
      enum: ['Text Campaign', 'Email Campaign'],
    },
    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema)
