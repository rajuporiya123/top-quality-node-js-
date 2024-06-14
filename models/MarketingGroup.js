const mongoose =  require("mongoose");

let marketingGroupSchema = new mongoose.Schema(
    {
        marketingGroupName: {
            type: String,
            default: ""
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model('MarketingGroup', marketingGroupSchema)
