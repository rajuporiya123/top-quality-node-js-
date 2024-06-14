const mongoose =  require("mongoose");

let emailTemplateSchema = new mongoose.Schema(
    {
        templateName: {
            type: String,
            default: ""
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        html: {
            type: String,
            default: ""
        },
        createdByAdmin: {
            type: Boolean,
            default: false
        },
        mailTemplateDesign: {
            type: Object,
            default: ""
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema)
