const mongoose = require("mongoose");

let organizerSchema = new mongoose.Schema(
    {
        organizerName: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        },
        organizerProfileImage: {
            type: String,
            default: ''
        },
        organizerBio: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        facebookId: {
            type: String,
            default: ''
        },
        twitterId: {
            type: String,
            default: ''
        },
        emailOption: {
            type: Boolean,
            default: false
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organizer", organizerSchema);
