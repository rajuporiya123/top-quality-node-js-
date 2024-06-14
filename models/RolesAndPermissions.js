const mongoose = require("mongoose");

let rolesAndPermissionSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            default: ''
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userStaff',
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        },
        userType: {
            type: String,
            default: ''
        },
        permissions: {
            type: String,
            default: '',
        },
        userStaffEmail: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("RolesAndPermission", rolesAndPermissionSchema);
