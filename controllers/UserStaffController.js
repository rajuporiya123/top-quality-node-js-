const User = require('../models/User')
const Ticket = require('../models/Ticket')
const RolesAndPermissions = require('../models/RolesAndPermissions')
const UserStaffService = require('../services/UserStaffService')
const jwt = require('jsonwebtoken')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const { Validator } = require('node-input-validator')
const Event = require('../models/Event')
const Pagination = require('../config/config')
const UserStaff = require('../models/UserStaff')
const bcrypt = require('bcryptjs')
const UserService = require('../services/UserService')
const uploadDocument = require('../config/config')
const Constant = require('../config/constant')
const { statuscode } = require('../config/codeAndMessage')
const randomstring = require('randomstring')
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const handlebarOptions = {
  viewEngine: {
    partialsDir: 'emails/',
    defaultLayout: false,
  },
  extName: '.hbs',
  viewPath: 'emails/',
}

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
)

transporter.use('compile', hbs(handlebarOptions))

exports.userStaffRegister = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      firstName: 'required',
      lastName: 'required',
      email: 'required',
      mobileNumber: 'required',
      password: 'required',
    })

    const matched = await validator.check()
    console.log('error', matched)
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: validator.errors,
      })
    }

    const email_check = {
      email: req.body.email,
      isInvited: false,
    }

    const check_user_name = await UserStaff.find(email_check)
    if (check_user_name.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Email already registered',
      })
    }

    const user_staff = await UserStaffService.updateStaffCommittee(req.body)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message:
        user_staff.userStaffType == 'staffMember'
          ? 'Staff Member registered successfully'
          : 'Committee Member registered successfully',
      data: user_staff,
    })
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.userStaffLogin = async (req, res) => {
  try {
    const { email, password, user_staff_type } = req.body

    const checkEmail = await UserStaff.find({
      email,
      userStaffType: user_staff_type,
    })
    const checkBlockUserStaff = await UserStaff.findOne({ email: email })
    // const checkEventManagerLogin = await UserService.checkEmail(email)

    // if (checkEventManagerLogin.length > 0) {
    //   return res.status(400).json({
    //     data: [],
    //     statusCode: statuscode.bad_request,
    //     success: false,
    //     message: "You can't login with the event manager",
    //   })
    // }

    if (checkEmail.length == 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Email does not exist.',
      })
    }

    if (checkBlockUserStaff.isBlockedByManager === true) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Your account is blocked. Please contact with admin',
      })
    }
    if (checkBlockUserStaff.isInvited === true) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please register your account using the link in your email.',
      })
    }

    if (!bcrypt.compareSync(password, checkEmail[0].password)) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Password is not match.',
      })
    } else {
      var token = jwt.sign(
        {
          id: checkEmail[0]._id,
          firstName: checkEmail[0].firstName,
          lastName: checkEmail[0].lastName,
          email: checkEmail[0].email,
          mobile_number: checkEmail[0].mobileNumber,
          isUserStaffEmailVerified: checkEmail[0].isUserStaffEmailVerified,
          isUserStaffMobileVerified: checkEmail[0].isUserStaffMobileVerified,
          isBlockedByManager: checkEmail[0].isBlockedByManager,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )

      var result = {
        token: token,
        id: checkEmail[0]._id,
        firstName: checkEmail[0].firstName,
        lastName: checkEmail[0].lastName,
        email: checkEmail[0].email,
        mobile_number: checkEmail[0].mobileNumber,
        isUserStaffEmailVerified: checkEmail[0].isUserStaffEmailVerified,
        isUserStaffMobileVerified: checkEmail[0].isUserStaffMobileVerified,
      }
      return res.status(200).json({
        data: result,
        success: true,
        statusCode: statuscode.success,
        message:
          req.body.user_staff_type == 'staffMember'
            ? 'Staff Member login successfully'
            : 'Committee Member login successfully',
      })
    }
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.inviteStaffAndCommitteeMember = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      eventId: 'required',
      user_staff_email: 'required',
    })

    const matched = await validator.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: validator.errors,
      })
    }
    // const user_type_check = {
    //   username: req.body.user_staff_email,
    //   userType: 'manager',
    // }

    // const check_user_type = await User.find(user_type_check)
    // if (check_user_type.length > 0) {
    //   return res.status(400).json({
    //     data: [],
    //     statusCode: statuscode.bad_request,
    //     success: false,
    //     message: "You can't invite event manager as staff or committee member",
    //   })
    // }

    const event = await Event.findOne({ _id: req.body.eventId })
    const user_staff = await UserStaff.findOne({
      email: req.body.user_staff_email,
    })
    if (user_staff?.isBlockedByManager) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: `This Member is already blocked`,
      })
    }
    if (user_staff?.userStaffType != req.body.user_type && user_staff) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: `This email is already associate with ${user_staff?.userStaffType}.`,
      })
    }
    // if (user_staff != null) {
    //   if (
    //     req.body.email == user_staff.email &&
    //     req.body.eventId == user_staff.eventId
    //   ) {
    //     return res.status(400).json({
    //       data: [],
    //       statusCode: statuscode.bad_request,
    //       success: false,
    //       message: 'This email is already registered for this event.',
    //     })
    //   }
    // }

    // let role = await RolesAndPermissions.findOne({ _id: req.body.roleId })
    let role_and_permissions_data = {
      permissions: req.body.permissions,
      userId: req.user.id,
      eventId: event._id,
      userType: req.body.user_type,
      userStaffEmail: req.body.user_staff_email,
    }
    const findROle = await RolesAndPermissions.findOne({
      eventId: event._id,
      userId: req.user.id,
      userStaffEmail: req.body.user_staff_email,
    })
    if (findROle == null) {
      var role = await RolesAndPermissions.create(role_and_permissions_data)
    }
    const permission_data = {
      eventId: event._id,
      managerUserId: req.user.id,
      permission: req.body.permissions,
    }
    let event_member_token = randomstring.generate()
    if (user_staff == null) {
      await UserStaff.create({
        email: req.body.user_staff_email,
        randomString: event_member_token,
        isInvited: true,
        userStaffType: req.body.user_type,
        eventData: permission_data,
      })
      if (req.body.user_type == 'staffMember') {
        const invite_data = {
          from: 'contact@carnivalist.com',
          to: req.body.user_staff_email,
          subject: 'Invite Staff Member',
          template: 'invite-staff-member',
          context: {
            event_name: event.eventTitle,
            link_url: `${process.env.CLIENT_URL}/invite-staff-member/${event_member_token}`,
            copyrightYear: new Date().getFullYear(),
          },
        }

        transporter.sendMail(invite_data, (err, body) => {
          if (err) {
            return res.status(400).json({
              success: false,
              statusCode: statuscode.bad_request,
              message: err.message,
              data: [],
            })
          } else {
            return res.status(200).json({
              success: true,
              statusCode: statuscode.success,
              message: 'Please check your email for event invitation',
            })
          }
        })
      } else {
        const invite_data = {
          from: 'contact@carnivalist.com',
          to: req.body.user_staff_email,
          subject: 'Invite Committee Member',
          template: 'invite-committee-member',
          context: {
            event_name: event.eventTitle,
            link_url: `${process.env.CLIENT_URL}/invite-committee-member/${event_member_token}`,
            copyrightYear: new Date().getFullYear(),
          },
        }

        transporter.sendMail(invite_data, (err, body) => {
          if (err) {
            return res.status(400).json({
              success: false,
              statusCode: statuscode.bad_request,
              message: err.message,
              data: [],
            })
          } else {
            return res.status(200).json({
              success: true,
              statusCode: statuscode.success,
              message: 'Please check your email for event invitation',
            })
          }
        })
      }
    } else {
      // let event_member_token = jwt.sign(
      //   {
      //     email: req.body.email,
      //     event_title: event.eventTitle,
      //     membershipType: req.body.user_type,
      //     eventId: event._id,
      //     managerUserId: req.user.id,
      //     roleId: role?._id,
      //     staffAndCommitteeMemberId: user_staff._id,
      //     isInvited: false,
      //   },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: '10m',
      //   }
      // )

      if (user_staff.userStaffType == 'staffMember') {
        // const permission_data = {
        //   eventId: event._id,
        //   managerUserId: req.user.id,
        //   permission: req.body.permissions,
        // }

        if (
          user_staff.eventData
            .map((object) => object.eventId.toString())
            .indexOf(event._id.toString()) == -1
        ) {
          user_staff.eventData.push(permission_data)
          await user_staff.save()
        } else {
          return res.status(400).json({
            data: [],
            statusCode: statuscode.bad_request,
            success: false,
            resendInvite: true,
            message: true,
          })
        }

        var invite_data = {
          from: 'contact@carnivalist.com',
          to: req.body.user_staff_email,
          subject: 'Invite Staff Member',
          template: 'invite-staff-member',
          context: {
            event_name: event.eventTitle,
            link_url: `${process.env.CLIENT_URL}/invite-staff-member/${event_member_token}`,
            copyrightYear: new Date().getFullYear(),
          },
        }
        user_staff.randomString = event_member_token
        user_staff.save()

        transporter.sendMail(invite_data, (err, body) => {
          if (err) {
            return res.status(400).json({
              success: false,
              statusCode: statuscode.bad_request,
              message: err.message,
              data: [],
            })
          } else {
            return res.status(200).json({
              success: true,
              statusCode: statuscode.success,
              message: 'Please check your email for event invitation',
            })
          }
        })
      } else {
        if (
          user_staff.eventData
            .map((object) => object.eventId.toString())
            .indexOf(event._id.toString()) == -1
        ) {
          user_staff.eventData.push(permission_data)
          await user_staff.save()
        } else {
          return res.status(400).json({
            data: [],
            statusCode: statuscode.bad_request,
            success: false,
            resendInvite: true,
            message: true,
          })
        }

        var invite_data = {
          from: 'contact@carnivalist.com',
          to: req.body.user_staff_email,
          subject: 'Invite Committee Member',
          template: 'invite-committee-member',
          context: {
            event_name: event.eventTitle,
            link_url: `${process.env.CLIENT_URL}/invite-committee-member/${event_member_token}`,
            copyrightYear: new Date().getFullYear(),
          },
        }
        user_staff.randomString = event_member_token
        user_staff.save()

        transporter.sendMail(invite_data, (err, body) => {
          if (err) {
            return res.status(400).json({
              success: false,
              statusCode: statuscode.bad_request,
              message: err.message,
              data: [],
            })
          } else {
            return res.status(200).json({
              success: true,
              statusCode: statuscode.success,
              message: 'Please check your email for event invitation',
            })
          }
        })
      }
    }
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error.message,
      data: [],
    })
  }
}

exports.resendInvite = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.body.eventId })
    const user_staff = await UserStaff.findOne({
      email: req.body.user_staff_email,
    })

    const event_member_token = randomstring.generate()

    if (user_staff.userStaffType == 'staffMember') {
      var invite_data = {
        from: 'contact@carnivalist.com',
        to: req.body.user_staff_email,
        subject: 'Invite Staff Member',
        template: 'invite-staff-member',
        context: {
          event_name: event.eventTitle,
          link_url: `${process.env.CLIENT_URL}/invite-staff-member/${event_member_token}`,
          copyrightYear: new Date().getFullYear(),
        },
      }
      user_staff.randomString = event_member_token
      user_staff.save()

      transporter.sendMail(invite_data, (err, body) => {
        if (err) {
          return res.status(400).json({
            success: false,
            statusCode: statuscode.bad_request,
            message: err,
            data: [],
          })
        } else {
          return res.status(200).json({
            success: true,
            statusCode: statuscode.success,
            message: 'Please check your email for event invitation',
          })
        }
      })
    } else {
      var invite_data = {
        from: 'contact@carnivalist.com',
        to: req.body.user_staff_email,
        subject: 'Invite Committee Member',
        template: 'invite-committee-member',
        context: {
          event_name: event.eventTitle,
          link_url: `${process.env.CLIENT_URL}/invite-committee-member/${event_member_token}`,
          copyrightYear: new Date().getFullYear(),
        },
      }
      user_staff.randomString = event_member_token
      user_staff.save()

      transporter.sendMail(invite_data, (err, body) => {
        if (err) {
          return res.status(400).json({
            success: false,
            statusCode: statuscode.bad_request,
            message: err,
            data: [],
          })
        } else {
          return res.status(200).json({
            success: true,
            statusCode: statuscode.success,
            message: 'Please check your email for event invitation',
          })
        }
      })
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getAllStaffMember = async (req, res) => {
  try {
    console.log(req.query, '<<<<<<<req.query>>>>>>>>>')
    const member_event = await UserStaffService.getStaffMember(
      req.query.membership_type,
      req.user.id,
      req.query.eventTitle
    )
    let event_member_paginator = await Pagination.paginator(
      member_event,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: event_member_paginator,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.deleteStaffMember = async (req, res) => {
  try {
    const delete_staff_member = await UserStaffService.destory(
      req.params.id,
      req.body.eventId
    )
    return res.status(200).json({
      success: true,
      data: delete_staff_member,
      statusCode: statuscode.success,
      message:
        req.body.user_staff_type == 'staffMember'
          ? 'Staff Member deleted successfully'
          : 'Committee Member deleted successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.blockStaffMember = async (req, res) => {
  try {
    const block_staff_member = await UserStaffService.blockStaff(
      req.body.userStaffId,
      req.body.isBlock
    )
    if (block_staff_member.userStaffType == 'staffMember') {
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: block_staff_member,
        message:
          req.body.isBlock == true
            ? 'Staff member is blocked'
            : 'Staff member is unblocked',
      })
    } else {
      return res.status(200).json({
        success: true,
        data: block_staff_member,
        statusCode: statuscode.success,
        message:
          req.body.isBlock == true
            ? 'Committee member is blocked'
            : 'Committee member is unblocked',
      })
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.userStaffRegisterLinkExpired = async (req, res) => {
  try {
    var check_email = await UserStaffService.checkLinkExpired(req.body.email)
    var data = false
    if (check_email.length > 0) {
      data = true
    } else {
      data = false
    }

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: data,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getUserStaffProfile = async (req, res) => {
  try {
    var staff_user = await UserStaffService.getUserStaffProfileData(req.user.id)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: staff_user[0],
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.updateUserStaffEvent = async (req, res) => {
  try {
    const user_staff = await UserStaffService.updateEventId(
      req.body.staffId,
      req.body.eventData,
      req.body.roleId,
      req.body.userId
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'User staff event updated successfully',
      data: user_staff,
    })
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
exports.getEventListForStaffAndCommitteeMember = async (req, res) => {
  try {
    var staff_user =
      await UserStaffService.getEventListForStaffAndCommitteeMember(
        req.params.userStaffId,
        req.query.userStaffType,
        req.query.search
      )
    let event_list_paginator = await Pagination.paginator(
      staff_user,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: event_list_paginator,
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.acceptEventForCommiteeMember = async (req, res) => {
  try {
    let accept_event
    if (req.body.isEventAccept == 'true') {
      accept_event = await UserStaff.findOneAndUpdate(
        { 'eventData.eventId': req.body.eventId, _id: req.params.userStaffId },
        {
          $set: {
            'eventData.$.isEventAccept': req.body.isEventAccept,
            'eventData.$.status': 'Accepted',
            'eventData.$.updatedAt': Date.now(),
          },
        },
        { new: true }
      )
    } else {
      accept_event = await UserStaff.findOneAndUpdate(
        { _id: req.params.userStaffId },
        {
          $pull: {
            eventData: { eventId: req.body.eventId },
          },
        }
      )
    }

    let event = await Event.findById(req.body.eventId)
    if (req.body.isEventAccept == 'true') {
      if (event?.userStaffId?.indexOf(req.params.userStaffId) == -1) {
        event.userStaffId.push(req.params.userStaffId)
        event.save()
      }
    } else {
      event?.userStaffId?.remove(req.params.userStaffId)
      event.save()
    }
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: accept_event,
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.updateUserStaffProfile = async (req, res, next) => {
  try {
    const v = new Validator(req.body, {
      first_name: 'required',
      last_name: 'required',
      email: 'required',
      domain_name: 'required',
      mobile_number: 'required',
    })

    const matched = await v.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: v.errors,
      })
    }
    let otp = Math.floor(1000 + Math.random() * 9000)
    var user_staff_update_data = {
      _id: req.user.id,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      mobileNumber: req.body.mobile_number,
      facebookUserName: req.body.facebook_username,
      twitterUserName: req.body.twitter_username,
      domainName: req.body.domain_name,
      otp: otp,
      isUserStaffEmailChanged: false,
      isUserStaffMobileChanged: false,
      jobTitle: req.body.job_title,
      organization: req.body.organization,
      addressLineOne: req.body.address_line_one,
      addressLineTwo: req.body.address_line_two,
      country: req.body.country,
      countryIso: req.body.country_iso,
      state: req.body.state,
      stateIso: req.body.state_iso,
      city: req.body.city,
      zipcode: req.body.zipcode,
    }

    if (req.body.image) {
      var upload_photo = await uploadDocument.uploadStaffImage(req)
      user_staff_update_data.image = upload_photo
    }
    await UserStaffService.updateStaffUser(user_staff_update_data)

    var all_user = await UserStaffService.getUserStaffProfileData(req.user.id)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: all_user[0],
      message: 'User Staff Profile updated successfully',
    })
  } catch (error) {
    console.log('Error in update user staff profile', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.verifyUserStaffMobileOtp = async (req, res) => {
  try {
    let user_staff = await UserStaff.findOne({
      email: req.body.email,
    })
    if (user_staff && req.body.mobileOtpValue === user_staff.otp) {
      await UserStaffService.verifyUserStaffMobile(
        req.body.mobile_number,
        req.body.email
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'OTP verified successfully',
      })
    } else {
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        message: 'Invalid OTP',
      })
    }
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.changeUserStaffPassword = async (req, res, next) => {
  try {
    const v = new Validator(req.body, {
      old_password: 'required',
      new_password: 'required',
      confirm_password: 'required|same:new_password',
    })

    const matched = await v.check()
    if (!matched) {
      return res.status(400).send({
        success: false,
        statusCode: statuscode.bad_request,
        data: v.errors,
        message: 'Something went to wrong.',
      })
    }

    const user_staff_detail = await UserStaffService.checkUserStaffEmail(
      req.user.email
    )

    if (
      !bcrypt.compareSync(req.body.old_password, user_staff_detail[0].password)
    ) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message:
          'Your old password was entered incorrectly. Please enter it again',
      })
    }

    var old_password_check = await Constant.passwordCompare(
      user_staff_detail[0].password,
      req.body.old_password
    )

    if (old_password_check === false) {
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        data: [],
        message: 'Your new password cannot be the same as the old password.',
      })
    } else {
      var old_and_new_password_check = await Constant.passwordCompare(
        user_staff_detail[0].password,
        req.body.new_password
      )

      if (old_and_new_password_check === true) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          data: [],
          message:
            'Old Password and New Password can not be same. Please enter new password different then old password.',
        })
      } else {
        var has_new_password_value = await Constant.passwordHashValue(
          req.body.new_password
        )

        await UserStaffService.updateUserStaffPassword(
          has_new_password_value,
          req.user.id
        )
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          data: [],
          message: 'Password changed successfully',
        })
      }
    }
  } catch (error) {
    console.log('login error ', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      data: [],
      message: 'Something went to wrong.',
    })
  }
}

exports.resendUserStaffMobileOTP = async (req, res) => {
  try {
    if (req.body.email != '') {
      let user_staff = await UserStaff.findOne({
        email: req.body.email,
      })
      if (user_staff) {
        let otp = Math.floor(1000 + Math.random() * 9000)
        await client.messages.create({
          body: otp,
          from: '+16303608149', //"+14695572198",
          to: user_staff.mobileNumber,
        })
        await UserStaffService.resendOtp(req.body.email, otp)
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Please check otp on your mobile',
        })
      } else {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: 'User staff not found',
          data: [],
        })
      }
    } else {
      if (req.body.mobile_number) {
        let otp = Math.floor(1000 + Math.random() * 9000)
        await client.messages.create({
          body: otp,
          from: '+16303608149', //"+14695572198",
          to: req.body.mobile_number,
        })
        await UserStaffService.sendMobileOtp(req.body.userStaffId, otp)
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Please check otp on your mobile',
        })
      } else {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: 'User staff not found',
          data: [],
        })
      }
    }
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.sendUserStaffProfileMobileOtp = async (req, res) => {
  try {
    let otp = Math.floor(1000 + Math.random() * 9000)
    await client.messages.create({
      body: otp,
      from: '+16303608149', //"+14695572198",
      to: '+' + req.body.mobile_number,
    })
    await UserStaffService.sendMobileOtp(req.user.id, otp)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Mobile Verification Otp Sent successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Mobile number is not verified from twilio account',
      data: error,
    })
  }
}

exports.sendUserStaffProfileVerificationEmail = async (req, res) => {
  try {
    const user_staff = await UserStaff.find({ _id: req.user.id })
    let otp = Math.floor(1000 + Math.random() * 9000)
    let token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    })
    const verify_email_data = {
      from: 'contact@carnivalist.com',
      to: req.body.email,
      subject: 'Email Verification Link',
      template: 'profile-email-verification',
      context: {
        first_name: user_staff[0].firstName,
        link_url: `${process.env.CLIENT_URL}/change-email-verify/${token}`,
        otp: otp,
        copyrightYear: new Date().getFullYear(),
      },
    }
    transporter.sendMail(verify_email_data)
    let data = await UserStaffService.updateEmailVerification(req.user.id, otp)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Email Verification Otp Sent successfully',
      data: data,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.userStaffProfileEmailVerification = async (req, res) => {
  try {
    let user_staff = await UserStaff.findOne({
      _id: req.user.id,
    })
    if (user_staff && req.body.otp === user_staff.otp) {
      const verify = await UserStaffService.userStaffProfileEmailVerification(
        req.user.id,
        req.body.otp
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'User Staff Profile Email Verification successfully',
        data: verify,
      })
    } else {
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        message: 'Invalid OTP',
      })
    }
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.getUserStaffDashboard = async (req, res) => {
  try {
    // const user_staff = await UserStaff.findOne({
    //   _id: req.user.id,
    // })

    // total_events = user_staff.eventData.length

    // let event_ids = []

    // const temp = user_staff.eventData.map((e) => {
    //   event_ids.push(e.eventId)
    // })

    // let ticket_sold_count_array = []
    // let ticket_sell_count_array = []

    // for (let i = 0; i < event_ids.length; i++) {
    //   const ticket_details = await Ticket.aggregate([
    //     {
    //       $project: {
    //         eventId: 1,
    //         soldTicket: 1,
    //         totalSell: {
    //           $multiply: [
    //             {
    //               $cond: {
    //                 if: { $eq: ['$soldTicket', ''] },
    //                 then: { $toInt: '0' },
    //                 else: { $toInt: '$soldTicket' },
    //               },
    //             },
    //             {
    //               $cond: {
    //                 if: { $eq: ['$price', 'Free'] },
    //                 then: { $toInt: '0' },
    //                 else: { $toInt: '$price' },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     },
    //     {
    //       $match: {
    //         eventId: event_ids[i],
    //       },
    //     },
    //   ])
    //   ticket_details.map((t) => {
    //     ticket_sold_count_array.push(t.soldTicket)
    //     ticket_sell_count_array.push(t.totalSell)
    //   })
    // }

    // const ticket_sold_count = ticket_sold_count_array.reduce(function (a, b) {
    //   return a + b
    // }, 0)
    // const ticket_sell_count = ticket_sell_count_array.reduce(function (a, b) {
    //   return a + b
    // }, 0)

    // const user_staff_dashboard_count = {
    //   total_events: total_events,
    //   ticket_sold_count: ticket_sold_count,
    //   ticket_sell_count: ticket_sell_count,
    // }
    const data = await UserStaffService.getDasboardData(req.user.id)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: data[0],
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err.message,
      data: [],
    })
  }
}

exports.resendUserStaffEmailOtp = async (req, res) => {
  try {
    let userstaff = await UserStaff.findOne({ _id: req.params.userId })
    let otp = Math.floor(1000 + Math.random() * 9000)
    const verify_email_data = {
      from: 'contact@carnivalist.com',
      to: req.body.email,
      subject: 'Email Verification Link',
      template: 'profile-email-verification',
      context: {
        first_name: userstaff.firstName,
        otp: otp,
        copyrightYear: new Date().getFullYear(),
      },
    }
    transporter.sendMail(verify_email_data)
    let data = await UserStaffService.updateOtpOnResendEmail(
      req.params.userId,
      otp
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Email Verification Otp Resend successfully',
      data: data,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}

exports.getDataBeforeRegister = async (req, res) => {
  try {
    let userstaff_data = await UserStaffService.getDataBeforeRegister(
      req.params.randomString
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Data retrive successfully',
      data: userstaff_data[0],
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: error,
    })
  }
}
