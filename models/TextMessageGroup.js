const mongoose =  require("mongoose");

let textMessageGroupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            default: ""
        },
        phoneNumber: [{
            type: String,
            default: []
        }],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model('TextMessageGroup', textMessageGroupSchema)
