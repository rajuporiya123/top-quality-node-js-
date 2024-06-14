const Event = require('../models/Event')
const UserStaff = require('../models/UserStaff')
const mongoose = require('mongoose')
const Helper = require('../config/helper')
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

module.exports = class UserStaffService {
  // static async create(data) {
  //   try {
  //     let password = await Helper.passwordHashValue(data.password)
  //     let otp = Math.floor(1000 + Math.random() * 9000)
  //     await client.messages.create({
  //       body: otp,
  //       from: '+16303608149',
  //       to: data.mobileNumber,
  //     })
  //     const create_staff_user = await UserStaff.create({
  //       firstName: data.firstName,
  //       lastName: data.lastName,
  //       email: data.email,
  //       mobileNumber: data.mobileNumber,
  //       password: password,
  //       userStaffType: data.userStaffType,
  //       managerUserId: data.managerUserId,
  //       eventData: data.eventData,
  //       roleId: data.roleId,
  //       isInvited: false,
  //       otp: otp,
  //       isUserStaffEmailVerified: true,
  //     })
  //     return create_staff_user
  //   } catch (error) {
  //     console.log(`Could not add user ${error}`)
  //     throw error
  //   }
  // }
  static async updateStaffCommittee(data) {
    try {
      let password = await Helper.passwordHashValue(data.password)
      let otp = Math.floor(1000 + Math.random() * 9000)
      await client.messages.create({
        body: otp,
        from: '+16303608149',
        to: data.mobileNumber,
      })
      return await UserStaff.findOneAndUpdate(
        { email: data.email },
        {
          firstName: data.firstName,
          lastName: data.lastName,
          //       email: data.email,
          mobileNumber: data.mobileNumber,
          password: password,
          //       userStaffType: data.userStaffType,
          //       managerUserId: data.managerUserId,
          //       eventData: data.eventData,
          //       roleId: data.roleId,
          isInvited: false,
          otp: otp,
          isUserStaffEmailVerified: true,
        }
      )
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async getStaffMember(
    membership_type,
    userId,
    eventTitle,
    globalSearch
  ) {
    try {
      let regex = new RegExp(eventTitle, 'i')
      let globalSearchRegex = new RegExp(globalSearch, 'i')
      let matchObj

      if (membership_type == 'staffMember') {
        if (globalSearch) {
          console.log('membership_type', membership_type)
          matchObj = {
            managerUserId: mongoose.Types.ObjectId(userId),
            isInvited: false,
            $or: [
              { eventName: globalSearchRegex },
              { firstName: globalSearchRegex },
              { lastName: globalSearchRegex },
              { email: globalSearchRegex },
            ],
          }
        } else {
          matchObj = {
            managerUserId: mongoose.Types.ObjectId(userId),
            userStaffType: membership_type,
            isInvited: false,
            $and: [
              {
                $or: [{ eventName: regex }],
              },
            ],
          }
        }
      } else {
        if (globalSearch) {
          console.log('membership_type', membership_type)
          matchObj = {
            managerUserId: mongoose.Types.ObjectId(userId),
            isInvited: false,
            status: 'Accepted',
            $or: [
              { eventName: globalSearchRegex },
              { firstName: globalSearchRegex },
              { lastName: globalSearchRegex },
              { email: globalSearchRegex },
            ],
          }
        } else {
          matchObj = {
            managerUserId: mongoose.Types.ObjectId(userId),
            userStaffType: membership_type,
            isInvited: false,
            status: 'Accepted',
            $and: [
              {
                $or: [{ eventName: regex }],
              },
            ],
          }
        }
      }

      let get_staff_member = await UserStaff.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventData.eventId',
            foreignField: '_id',
            as: 'EventDetail',
          },
        },
        {
          $unwind: {
            path: '$EventDetail',
            // preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            filteredEventData: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$eventData',
                    as: 'data',
                    cond: { $eq: ['$$data.eventId', '$EventDetail._id'] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            userStaffType: 1,
            status: '$filteredEventData.status',
            updatedAt: '$filteredEventData.updatedAt',
            firstName: 1,
            lastName: 1,
            email: 1,
            isInvited: 1,
            eventId: '$EventDetail._id',
            managerUserId: '$EventDetail.userId',
            eventName: '$EventDetail.eventTitle',
            isBlockedByManager: 1,
            createdAt: 1,
          },
        },
        {
          $match: matchObj,
        },
        { $sort: { updatedAt: -1 } },
      ])

      // console.log(membership_type, '<<<<<membership_type>>>>>')
      // let filtered
      // if (membership_type == 'staffMember') {
      //   filtered = get_staff_member
      // } else {
      //   // console.log('Hello')
      //   filtered = get_staff_member.filter(
      //     (s) => s.eventData[0].status == 'Accepted'
      //   )
      // }

      // let myArray = []

      // get_staff_member.map((s) => {
      //   s?.eventData?.map((m) => {
      //     if (m.managerUserId == userId) {
      //       myArray.push({
      //         firstName: s.firstName,
      //         lastName: s.lastName,
      //         userStaffType: s.userStaffType,
      //         isBlockedByManager: s.isBlockedByManager,
      //         email: s.email,
      //         eventName: m.eventId,
      //         eventDataId: m._id,
      //         _id: s._id,
      //         managerUserId: m.managerUserId,
      //       })
      //     }
      //   })
      // })

      // for (let i = 0; i <= myArray.length - 1; i++) {
      //   const eventName = await Event.find({
      //     _id: mongoose.Types.ObjectId(myArray[i].eventName),
      //   })
      //   myArray[i].eventName = eventName[0]?.eventTitle
      // }

      // let filteredArray = myArray.filter(function (m) {
      //   return m.eventName == eventTitle
      // })

      // return filtered
      return get_staff_member
    } catch (error) {
      console.log(`Could not get staff member ${error}`)
      throw error
    }
  }

  static async destory(userStaffId, eventId) {
    try {
      let user_staff_delete_data = await UserStaff.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(userStaffId) },
        {
          $pull: { eventData: { eventId: mongoose.Types.ObjectId(eventId) } },
        }
      )

      return user_staff_delete_data
    } catch (error) {
      console.log('Error is user staff deleting', error)
      throw error
    }
  }

  static async blockStaff(userStaffId, isBlock) {
    try {
      let block_user_staff = await UserStaff.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(userStaffId) },
        {
          isBlockedByManager: isBlock,
        }
      )

      return block_user_staff
    } catch (error) {
      console.log('Error is blocking user staff', error)
      throw error
    }
  }

  static async checkLinkExpired(email) {
    try {
      const check_value = await UserStaff.find({
        email: email,
        isInvited: false,
      })
      return check_value
    } catch (error) {
      console.log(`Could not fetch link expired Data ${error}`)
      throw error
    }
  }

  static async updateInvitedMembers(isInvited) {
    try {
      const check_value = await UserStaff.updateOne({ isInvited: isInvited })
      return check_value
    } catch (error) {
      console.log(`Could not fetch link expired Data ${error}`)
      throw error
    }
  }

  static async getUserStaffProfileData(userStaffId) {
    try {
      var aggregate = await UserStaff.aggregate([
        {
          $lookup: {
            from: 'rolesandpermissions',
            localField: 'roleId',
            foreignField: '_id',
            as: 'RoleDetail',
          },
        },
        {
          $unwind: {
            path: '$RoleDetail',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            image: {
              $concat: [process.env.USER_STAFF_PROFILE_IMAGE, '$image'],
            },
            mobileNumber: 1,
            roleId: 1,
            roleName: '$RoleDetail.roleName',
            permissions: '$RoleDetail.permissions',
            userStaffType: 1,
            isUserStaffEmailChanged: 1,
            isUserStaffMobileChanged: 1,
            isUserStaffMobileVerified: 1,
            isUserStaffEmailVerified: 1,
            facebookUserName: 1,
            twitterUserName: 1,
            domainName: 1,
            jobTitle: 1,
            organization: 1,
            addressLineOne: 1,
            addressLineTwo: 1,
            country: 1,
            countryIso: 1,
            state: 1,
            stateIso: 1,
            city: 1,
            zipcode: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(userStaffId),
          },
        },
      ])
      return aggregate
    } catch (error) {
      console.log('Get User Profile Data Error', error)
      throw error
    }
  }

  static async updateEventId(staffId, eventData, roleId, userId) {
    try {
      let staff = await UserStaff.findById({ _id: staffId })
      for (var i = 0; i <= eventData.length - 1; i++) {
        staff.eventData.push(eventData[i])
      }
      for (var i = 0; i <= roleId.length - 1; i++) {
        staff.roleId.push(roleId[i])
      }
      for (var i = 0; i <= userId.length - 1; i++) {
        staff.managerUserId.push(userId[i])
      }
      let update_event_data = await staff.save()
      return update_event_data
    } catch (error) {
      console.log('Error in update event', error)
      throw error
    }
  }

  static async getEventListForStaffAndCommitteeMember(
    userStaffId,
    userStaffType,
    search
  ) {
    try {
      let regex = new RegExp(search, 'i')
      if (userStaffType == 'staffMember') {
        let get_event_list = await UserStaff.aggregate([
          {
            $lookup: {
              from: 'events',
              localField: 'eventData.eventId',
              foreignField: '_id',
              as: 'EventDetail',
            },
          },
          {
            $unwind: '$EventDetail',
          },
          {
            $lookup: {
              from: 'tickets',
              localField: 'EventDetail._id',
              foreignField: 'eventId',
              as: 'TicketDetail',
            },
          },
          {
            $lookup: {
              from: 'ticketsells',
              localField: 'EventDetail._id',
              foreignField: 'eventId',
              as: 'TicketSellDetail',
            },
          },
          // {
          //   $lookup: {
          //     from: 'rolesandpermissions',
          //     localField: 'EventDetail._id',
          //     foreignField: 'eventId',
          //     as: 'RoleDetail',
          //   },
          // },
          // {
          //   $unwind: '$RoleDetail',
          // },
          {
            $addFields: {
              permissions: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$eventData',
                      as: 'item',
                      cond: { $eq: ['$$item.eventId', '$EventDetail._id'] },
                    },
                  },
                  0,
                ],
              },
              evetaccept: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$eventData',
                      as: 'item',
                      cond: { $eq: ['$$item.eventId', '$EventDetail._id'] },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              userStaffType: 1,
              eventTitle: '$EventDetail.eventTitle',
              slug:'$EventDetail.slug',
              eventId: '$EventDetail._id',
              isDeleted: '$EventDetail.isDeleted',
              eventStartDate: '$EventDetail.startDate',
              eventStartTime: '$EventDetail.startTime',
              permissions: '$permissions.permission',
              isEventAccept: '$evetaccept.isEventAccept',
              status: '$evetaccept.status',
              updatedAt: '$evetaccept.updatedAt',
              toBeAnnounced: '$EventDetail.toBeAnnounced',
              toBeAnnouncedDate: '$EventDetail.toBeAnnouncedDate',
              banner: {
                $concat: [process.env.EVENT_BANNER, '$EventDetail.banner'],
              },
              totalTickets: {
                $sum: {
                  $map: {
                    input: '$TicketDetail',
                    as: 'ticketQuantity',
                    in: { $toInt: '$$ticketQuantity.availableQuantity' },
                  },
                },
              },
              soldTickets: {
                $sum: {
                  $map: {
                    input: '$TicketDetail',
                    as: 'ticket',
                    in: {
                      $cond: {
                        if: { $eq: ['$$ticket.soldTicket', ''] },
                        then: { $toInt: '0' },
                        else: { $toInt: '$$ticket.soldTicket' },
                      },
                    },
                  },
                },
              },
              gross: {
                $sum: {
                  $map: {
                    input: '$TicketSellDetail',
                    as: 'sell',
                    in: {
                      $cond: {
                        if: { $eq: ['$$sell.price', null] },
                        then: {
                          $add: { $toInt: '0' },
                        },
                        else: {
                          $cond: {
                            if: { $eq: ['$$sell.price', "Free"] },
                            then: {
                              $add: { $toInt: '0' },
                            },
                            else: {
                              $add: { $toInt: '$$sell.price' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(userStaffId),
              userStaffType: userStaffType,
            },
          },
          {
            $sort: { updatedAt: -1 },
          },
        ])

        // for(let i = 0; i <= get_event_list.length - 1; i++){
        //   const userStaff = await UserStaff.find({_id:mongoose.Types.ObjectId(userStaffId)})
        //   get_event_list[i].isEventAccept = userStaff[0]?.eventData[i]?.isEventAccept
        // }

        return get_event_list
      } else {
        let get_event_list = await UserStaff.aggregate([
          {
            $lookup: {
              from: 'events',
              localField: 'eventData.eventId',
              foreignField: '_id',
              as: 'EventDetail',
            },
          },
          {
            $unwind: {
              path: '$EventDetail',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'tickets',
              localField: 'EventDetail._id',
              foreignField: 'eventId',
              as: 'TicketDetail',
            },
          },
          {
            $lookup: {
              from: 'ticketsells',
              localField: 'EventDetail._id',
              foreignField: 'eventId',
              as: 'TicketSellDetail',
            },
          },
          {
            $addFields: {
              permissions: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$eventData',
                      as: 'item',
                      cond: { $eq: ['$$item.eventId', '$EventDetail._id'] },
                    },
                  },
                  0,
                ],
              },
              evetaccept: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$eventData',
                      as: 'item',
                      cond: { $eq: ['$$item.eventId', '$EventDetail._id'] },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              userStaffType: 1,
              isEventAccept: '$eventData.isEventAccept',
              eventTitle: '$EventDetail.eventTitle',
              slug:'$EventDetail.slug',
              eventId: '$EventDetail._id',
              isDeleted: '$EventDetail.isDeleted',
              eventStartDate: '$EventDetail.startDate',
              eventStartTime: '$EventDetail.startTime',
              permissions: '$permissions.permission',
              isEventAccept: '$evetaccept.isEventAccept',
              status: '$evetaccept.status',
              updatedAt: '$evetaccept.updatedAt',
              toBeAnnounced: '$EventDetail.toBeAnnounced',
              toBeAnnouncedDate: '$EventDetail.toBeAnnouncedDate',
              banner: {
                $concat: [process.env.EVENT_BANNER, '$EventDetail.banner'],
              },
              totalTickets: {
                $sum: {
                  $map: {
                    input: '$TicketDetail',
                    as: 'ticketQuantity',
                    in: { $toInt: '$$ticketQuantity.availableQuantity' },
                  },
                },
              },
              soldTickets: {
                $sum: {
                  $map: {
                    input: '$TicketDetail',
                    as: 'ticket',
                    in: {
                      $cond: {
                        if: { $eq: ['$$ticket.soldTicket', ''] },
                        then: { $toInt: '0' },
                        else: { $toInt: '$$ticket.soldTicket' },
                      },
                    },
                  },
                },
              },
              gross: {
                $sum: {
                  $map: {
                    input: '$TicketSellDetail',
                    as: 'sell',
                    in: {
                      $cond: {
                        if: { $eq: ['$$sell.price', null] },
                        then: {
                          $add: { $toInt: '0' },
                        },
                        else: {
                          $cond: {
                            if: { $eq: ['$$sell.price', "Free"] },
                            then: {
                              $add: { $toInt: '0' },
                            },
                            else: {
                              $add: { $toInt: '$$sell.price' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(userStaffId),
              userStaffType: userStaffType,
              eventTitle: regex,
              $or: [{ status: 'Accepted' }, { status: 'Pending' }],
            },
          },
          {
            $sort: { updatedAt: -1 },
          },
        ])

        // for(let i = 0; i <= get_event_list.length - 1; i++){
        //   const userStaff = await UserStaff.find({_id:mongoose.Types.ObjectId(userStaffId)})
        //   get_event_list[i].isEventAccept = userStaff[0]?.eventData[i]?.isEventAccept
        // }

        return get_event_list
      }
    } catch (error) {
      console.log(`Could not get staff member ${error}`)
      throw error
    }
  }

  static async updateStaffUser(update_data) {
    try {
      let update_user_data = await UserStaff.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_user_data
    } catch (error) {
      console.log('Error in update staff user', error)
      throw error
    }
  }

  static async verifyUserStaffMobile(mobileNumber, email) {
    try {
      let verify_user_staff_mobile_data = await UserStaff.findOneAndUpdate(
        { email: email },
        {
          mobileNumber: mobileNumber,
          isUserStaffMobileVerified: true,
        },
        { new: true }
      )
      return verify_user_staff_mobile_data
    } catch (error) {
      console.log('Error in verify user staff mobile', error)
      throw error
    }
  }

  static async checkUserStaffEmail(email) {
    try {
      const checkUserStaffEmail = await UserStaff.find({ email: email })
      return checkUserStaffEmail
    } catch (error) {
      console.log(`Could not fetch user staff email ${error}`)
      throw error
    }
  }

  static async updateUserStaffPassword(password, user_id) {
    try {
      var user_password_update = await UserStaff.updateOne(
        { _id: user_id },
        { password: password }
      )
      return user_password_update
    } catch (error) {
      console.log(`Error in update password ${error}`)
      throw error
    }
  }

  static async checkEmail(email, userStaffType) {
    try {
      const checkEmail = await UserStaff.find({
        email: email,
        userStaffType: userStaffType,
      })
      console.log('jhjk', checkEmail)
      return checkEmail
    } catch (error) {
      console.log(`Could not fetch user staff email ${error}`)
      throw error
    }
  }

  static async resendOtp(email, otp) {
    try {
      let resend_otp = await UserStaff.updateOne({ email: email }, { otp: otp })
      return resend_otp
    } catch (error) {
      console.log('Error in resend otp', error)
      throw error
    }
  }

  static async sendMobileOtp(userStaffId, otp) {
    try {
      let send_otp = await UserStaff.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(userStaffId) },
        {
          otp: otp,
        }
      )
      return send_otp
    } catch (error) {
      console.log('Error in send otp', error)
      throw error
    }
  }

  static async updateEmailVerification(userStaffId, otp) {
    try {
      let update_email_verification = await UserStaff.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(userStaffId) },
        {
          isUserStaffEmailVerified: true,
          otp: otp,
        },
        {
          new: true,
        }
      )
      return update_email_verification
    } catch (error) {
      console.log('Error in update email verification', error)
      throw error
    }
  }

  static async userStaffProfileEmailVerification(userId, otp) {
    try {
      let user_staff_profile_email_verification_data =
        await UserStaff.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(userId) },
          {
            otp: otp,
            isUserStaffEmailVerified: true,
            isUserStaffEmailChanged: true,
          }
        )
      return user_staff_profile_email_verification_data
    } catch (error) {
      console.log('Error in user staff profile email verification', error)
      throw error
    }
  }

  static async updateOtpOnResendEmail(userId, otp) {
    try {
      let update_email_verification = await UserStaff.findByIdAndUpdate(
        userId,
        {
          otp: otp,
        }
      )
      return update_email_verification
    } catch (error) {
      console.log('Error in update email verification', error)
      throw error
    }
  }

  static async getDataBeforeRegister(randomString) {
    try {
      let userstaff_data = await UserStaff.aggregate([
        {
          $match: {
            randomString: randomString,
          },
        },
        {
          $project: {
            email: 1,
            isInvited: 1,
            membershipType: '$userStaffType',
            randomString: 1,
            eventData: { $arrayElemAt: ['$eventData', -1] },
          },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventData.eventId',
            foreignField: '_id',
            as: 'EventDetails',
          },
        },
        {
          $unwind: {
            path: '$EventDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            email: 1,
            isInvited: 1,
            eventTitle: '$EventDetails.eventTitle',
            membershipType: 1,
          },
        },
      ])
      return userstaff_data
    } catch (error) {
      console.log('Error in getDataBeforeRegister service', error)
      throw error
    }
  }
  static async getDasboardData(userId) {
    try {
      return await UserStaff.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventData.eventId',
            foreignField: '_id',
            as: 'EventDetail',
            pipeline: [
              {
                $lookup: {
                  from: 'tickets',
                  localField: '_id',
                  foreignField: 'eventId',
                  as: 'ticketDetails',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'ticketsells',
                        localField: '_id',
                        foreignField: 'ticketId',
                        as: 'tickeSales',
                        pipeline: [
                          {
                            $project: {
                              price: {
                                $cond: {
                                  if: { $eq: ['$price', 'Free'] },
                                  then: 0,
                                  else: {
                                    $cond: {
                                      if: { $eq: ['$price', null] },
                                      then: 0,
                                      else: {
                                        $convert: { input: '$price', to: 'int' },
                                      },
                                    },
                                  },
                                },
                              },
                              ticketId: 1,
                            },
                          },
                          {
                            $group: {
                              _id: '$ticketId',
                              Sales: { $sum: '$price' },
                            },
                          },
                        ],
                      },
                    },
                    {
                      $addFields: {
                        tickeSales: { $arrayElemAt: ['$tickeSales', 0] },
                      },
                    },
                    {
                      $project: {
                        tickeSales: '$tickeSales.Sales',
                        // tickeSales:"$ticketSales.Sales",
                        name: 1,
                        availableQuantity: 1,
                        soldTicket: 1,
                        price: 1,
                      },
                    },
                  ],
                },
              },

              // {
              //   $addFields:{
              //    IntTickets:{
              //     $map: {
              //       input: "$ticketSells",
              //       as: "value",
              //       // in: {$cond:{ $convert: { input: "$$value.price", to: "int" } }}
              //       in: {
              //         $cond: { if: { $eq: [ "$$value.price", "Free" ] }, then: 0, else: { $convert: { input: "$$value.price", to: "int" } } }
              //       }
              //     }
              //    }
              //   }
              // },
              {
                $project: {
                  _id: 1,
                  isDeleted: 1,
                  eventTitle: 1,
                  userId: 1,
                  'ticketDetails.name': 1,
                  'ticketDetails._id': 1,
                  'ticketDetails.availableQuantity': 1,
                  'ticketDetails.soldTicket': 1,
                  'ticketDetails.price': 1,
                  'ticketDetails.tickeSales': 1,

                  // ticketSales:{$sum:"$IntTickets"}
                  // "graphValue":{$arrayElemAt:["$graphValue.ticketSold",0]}
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            EventDetail: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId),
          },
        },
      ])
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async getUserStaffData(randomString) {
    try {
      var get_userStaff_data = await UserStaff.findOne({
        randomString: randomString,
      })
      return get_userStaff_data
    } catch (error) {
      console.log('Get Event Manager Data Error', error)
      throw error
    }
  }
}
