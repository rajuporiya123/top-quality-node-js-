const mongoose = require('mongoose')

let userStaffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'y0xkTWIM3euRFqn4XdAF3mzW5DP0OQM0.jpg',
    },
    password: {
      type: String,
      default: '',
    },
    mobileNumber: {
      type: String,
      default: '',
    },
    eventData: [
      {
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Event',
        },
        managerUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isEventAccept: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Rejected'],
          default: 'Pending',
        },
        permission: {
          type: String,
          enum: ['Full Access', 'Basic Access', 'Intermediate Access'],
          default: 'Full Access',
        },
        updatedAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    // managerUserId: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],
    // roleId: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'RolesAndPermission'
    // }],
    userStaffType: {
      type: String,
      enum: ['staffMember', 'committeeMember'],
    },
    isBlockedByManager: {
      type: Boolean,
      default: false,
    },
    isInvited: {
      type: Boolean,
      default: true,
    },
    domainName: {
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
    otp: {
      type: String,
      default: 0,
    },
    isUserStaffEmailChanged: {
      type: Boolean,
      default: false,
    },
    isUserStaffMobileChanged: {
      type: Boolean,
      default: false,
    },
    isUserStaffMobileVerified: {
      type: Boolean,
      default: false,
    },
    isUserStaffEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: '',
    },
    randomString: {
      type: String,
      default: '',
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
  },
  { timestamps: true }
)

module.exports = mongoose.model('UserStaff', userStaffSchema)
