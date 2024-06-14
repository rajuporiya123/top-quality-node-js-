const mongoose = require('mongoose')

let userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: '',
    },
    name: {
      type: String,
    },
    lastName: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    domainName: {
      type: String,
      default: '',
    },
    mobileNumber: {
      type: String,
      default: '',
    },
    countryCode: {
      type: String,
      default: '',
    },
    facebookUserName: {
      type: String,
      default: '',
    },
    twitterUserName: {
      type: String,
      default: '',
    },
    userType: {
      type: String,
      enum: ['admin', 'manager'],
      default: 'manager',
    },
    otp: {
      type: String,
      default: '0',
    },
    stripeState: {
      type: String,
      default: '',
    },
    stripeAccountId: {
      type: String,
      default: '',
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    avatar: {
      type: String,
      default: 'y0xkTWIM3euRFqn4XdAF3mzW5DP0OQM0.jpg',
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    isInvited: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: '',
    },
    facebookId: {
      type: String,
      default: '',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    isEmailChanged: {
      type: Boolean,
      default: false,
    },
    isMobileChanged: {
      type: Boolean,
      default: false,
    },
    jobTitle: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: '',
    },
    addressLineOne: {
      type: String,
      default: '',
    },
    addressLineTwo: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    countryIso: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    stateIso: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    zipcode: {
      type: Number,
      default: 0,
    },
    randomString: {
      type: String,
      default: '',
    },
    isInitialLogin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('user', userSchema)
