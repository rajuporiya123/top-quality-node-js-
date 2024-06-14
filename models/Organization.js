const mongoose = require("mongoose");

let organizationSchema = new mongoose.Schema(
    {
        organizationName: {
            type: String,
            default: ''
        },
        prefferedCountry: {
            type: String,
            default: ''
        },
        organizationLogo: {
            type: String,
            default: ''
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
