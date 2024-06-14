const mongoose = require('mongoose')
const { pipeline } = require('nodemailer/lib/xoauth2')
const RolesAndPermission = require('../models/RolesAndPermissions')
const UserStaff = require('../models/UserStaff')

module.exports = class RolesAndPermissionService {
  static async create(data) {
    try {
      const create_roles_and_permission = await RolesAndPermission.create(data)
      return create_roles_and_permission
    } catch (error) {
      console.log(`Could not add roles and permission ${error}`)
      throw error
    }
  }

  static async getRolesAndPermissions(userId) {
    try {
      const get_roles_and_permissions = await RolesAndPermission.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },
        {
          $unwind: '$userDetail',
        },
        {
          $project: {
            roleName: 1,
            permissions: 1,
            userId: 1,
            eventId: 1,
            userType: 1,
            email: '$userDetail.email',
            userStaffEmail: 1,
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
      ])
      return get_roles_and_permissions
    } catch (error) {
      console.log(`Could not get roles and permissions ${error}`)
      throw error
    }
  }

  static async editRolesAndPermissions(eventId, userStaffId) {
    try {
      return await UserStaff.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventData.eventId',
            foreignField: '_id',
            as:'eventDetails',
            pipeline:[
              {
                $project:{
                  eventTitle: 1
                }
              },
              {
                $match:{
                  _id:mongoose.Types.ObjectId(eventId)
                }
              }
            ]
          },
        },
        {
          $addFields:{
            Event:{
              $arrayElemAt: ["$eventDetails",0]
            },
            permission:{
              $arrayElemAt:[ {
                $filter:{
                input: '$eventData',
                as: 'val',
                cond: {$eq:["$$val.eventId",mongoose.Types.ObjectId(eventId)]}
              }},0]
            }
          }
        },
        { 
          $project:{
            userStaffEmail:"$email",
            eventId:"$Event._id",
            eventTitle:"$Event.eventTitle",
            permissions:"$permission.permission",
            userStaffType:1
          }
        },
        {
          $match:{
            _id:mongoose.Types.ObjectId(userStaffId),
          }
        }
      ])
      // const edit_roles_and_permissions = await RolesAndPermission.aggregate([
      //   {
      //     $lookup: {
      //       from: 'userstaffs',
      //       localField: 'userStaffEmail',
      //       foreignField: 'email',
      //       as: 'userstaffDetails',
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: '$userstaffDetails',
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'events',
      //       localField: 'eventId',
      //       foreignField: '_id',
      //       as: 'eventDetails',
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: '$eventDetails',
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       userStaffType: '$userstaffDetails.userStaffType',
      //       eventTitle: '$eventDetails.eventTitle',
      //       roleName: 1,
      //       permissions: 1,
      //       userId: 1,
      //       eventId: 1,
      //       userType: 1,
      //       userStaffEmail: 1,
      //     },
      //   },
      //   {
      //     $match: {
      //       userId: mongoose.Types.ObjectId(userStaffId),
      //       eventId: mongoose.Types.ObjectId(eventId),
      //     },
      //   },
      // ])
      // return edit_roles_and_permissions
    } catch (error) {
      console.log(`Could not edit roles and permissions ${error}`)
      throw error
    }
  }

  static async update(id, update_data) {
    try {
      let update_roles_and_permissions_data =
        await RolesAndPermission.updateOne({ _id: id }, update_data)
      return update_roles_and_permissions_data
    } catch (error) {
      console.log('Error in update roles and permission data', error)
      throw error
    }
  }

  static async destory(id) {
    try {
      let roles_and_permissions_delete_data =
        await RolesAndPermission.deleteOne({
          _id: mongoose.Types.ObjectId(id),
        })

      return roles_and_permissions_delete_data
    } catch (error) {
      console.log('Error in roles and permissions deleting', error)
      throw error
    }
  }
}
