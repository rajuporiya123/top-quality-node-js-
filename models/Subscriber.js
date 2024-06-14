const mongoose = require("mongoose");

let subscriberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        countryCode: {
            type: String,
            default: ""
        },
        mobileNumber: {
            type: Number,
            default: 0
        },
        marketingGroupId: {
            type: mongoose.Types.ObjectId,
            ref: 'MarketingGroup'
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Subscriber', subscriberSchema)
