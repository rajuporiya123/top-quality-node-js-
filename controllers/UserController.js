const User = require('../models/User')
const UserStaff = require('../models/UserStaff')
const jwt = require('jsonwebtoken')
const UserService = require('../services/UserService')
const UserStaffService = require('../services/UserStaffService')
const Helper = require('../config/helper')
const bcrypt = require('bcryptjs')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const Constant = require('../config/constant')
const { Validator } = require('node-input-validator')
const uploadDocument = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const randomstring = require('randomstring')
const { default: mongoose } = require('mongoose')

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

exports.signup = async (req, res) => {
  try {
    if (req.body.user_type == 'manager') {
      const validator = new Validator(req.body, {
        first_name: 'required',
        last_name: 'required',
        username: 'required',
        mobile_number: 'required',
        password: 'required',
        domain_name: 'required',
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
    }

    const email_check = {
      username: req.body.username,
    }

    const check_user_name = await User.find(email_check)
    if (check_user_name.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Email already registered',
      })
    }

    // const mobile_number_check = {
    //   mobileNumber: req.body.mobile_number,
    // }

    // const check_mobile_number = await User.find(mobile_number_check)
    // if (check_mobile_number.length > 0) {
    //   return res.status(400).json({
    //     data: [],
    //     statusCode: statuscode.bad_request,
    //     success: false,
    //     message: 'Mobile number already registered',
    //   })
    // }

    let password = await Helper.passwordHashValue(req.body.password)

    if (req.body.user_type == 'manager') {
      const domain_name = await User.find({ domainName: req.body.domain_name })
      if (domain_name.length > 0) {
        return res.status(400).json({
          data: [],
          statusCode: statuscode.bad_request,
          success: false,
          message: 'Already exist, enter a unique domain name',
        })
      }
      let check_link = randomstring.generate()
      const data = {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        username: req.body.username,
        mobileNumber: req.body.mobile_number,
        password: password,
        domainName: req.body.domain_name,
        userType: req.body.user_type,
        isInvited: true,
        randomString: check_link,
      }

      const user = await UserService.create(data)

      // let token = jwt.sign(
      //   {
      //     _id: user._id,
      //     email: user.email,
      //     isVerified: false,
      //     createdAt: user.createdAt,
      //     updatedAt: user.updatedAt,
      //   },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: '30d',
      //   }
      // )
      const send_email_data = {
        from: 'contact@carnivalist.com',
        to: req.body.username,
        subject: 'Register Confirmation Link',
        template: 'user-email-verification',
        context: {
          first_name: user.firstName,
          link_url: `${process.env.CLIENT_URL}/verify-email/${check_link}`,
          copyrightYear: new Date().getFullYear(),
        },
      }

      transporter.sendMail(send_email_data, (err, body) => {
        if (err) {
          return res.json({ error: err.message })
        }
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          data: user,
          message: 'Email has been sent, kindly Follow the instruction',
        })
      })

      // return res.status(200).json({
      //     success: 1,
      //     message: "User Registered Successfully",
      //     data: user
      // })
    } else {
      let check_link = randomstring.generate()
      const data = {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        username: req.body.username,
        mobileNumber: req.body.mobile_number,
        password: password,
        eventId: req.body.eventId,
        userType: req.body.user_type,
        isInvited: true,
        randomString: check_link,
      }

      const user = await UserService.create(data)
      // let token = jwt.sign(
      //   {
      //     _id: user._id,
      //     email: user.email,
      //     isVerified: false,
      //     createdAt: user.createdAt,
      //     updatedAt: user.updatedAt,
      //   },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: '30d',
      //   }
      // )
      const send_email_data = {
        from: 'contact@carnivalist.com',
        to: req.body.username,
        subject: 'Register Confirmation Link',
        template: 'user-email-verification',
        context: {
          first_name: user.firstName,
          link_url: `${process.env.CLIENT_URL}/verify-email/${check_link}`,
          copyrightYear: new Date().getFullYear(),
        },
      }

      transporter.sendMail(send_email_data, (err, body) => {
        if (err) {
          return res.json({ error: err.message })
        }
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          data: user,
          message: 'Email has been sent, kindly Follow the instruction',
        })
      })

      // return res.status(200).json({
      //     success: 1,
      //     message: "Event Member Registered Successfully",
      //     data: user
      // })
    }
  } catch (error) {
    console.log('err', error)
  }
}

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body

    const checkEmail = await User.find({ username: username, isDeleted: false })
    console.log(checkEmail, 'checkEmail')

    if (checkEmail.length == 0 || checkEmail[0].userType == 'consumer') {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message:
          'We do not have an account registered with the email address entered.',
      })
    }

    if (!bcrypt.compareSync(password, checkEmail[0].password)) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Password does not match.',
      })
    } else {
      var token = jwt.sign(
        {
          id: checkEmail[0]._id,
          firstName: checkEmail[0].firstName,
          lastName: checkEmail[0].lastName,
          username: checkEmail[0].username,
          mobileNumber: checkEmail[0].mobileNumber,
          domainName: checkEmail[0].domainName,
          avatar: process.env.PROFILE_IMAGE + checkEmail[0].avatar,
          isVerified: checkEmail[0].isVerified,
          isMobileVerified: checkEmail[0].isMobileVerified,
          stripeState: checkEmail[0].stripeState,
          stripeAccountId: checkEmail[0].stripeAccountId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )

      var result = {
        token: token,
        isInitialLogin: checkEmail[0].isInitialLogin,
        id: checkEmail[0]._id,
        firstName: checkEmail[0].firstName,
        lastName: checkEmail[0].lastName,
        username: checkEmail[0].username,
        mobileNumber: checkEmail[0].mobileNumber,
        domainName: checkEmail[0].domainName,
        avatar: process.env.PROFILE_IMAGE + checkEmail[0].avatar,
        isVerified: checkEmail[0].isVerified,
        isMobileVerified: checkEmail[0].isMobileVerified,
        stripeState: checkEmail[0].stripeState,
        stripeAccountId: checkEmail[0].stripeAccountId,
      }

      const updateInitialLoginStatus = await User.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(checkEmail[0]._id) },
        {
          isInitialLogin: false,
        }
      )

      return res.status(200).json({
        data: result,
        statusCode: statuscode.success,
        success: true,
        message: 'User login successfully',
      })
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

exports.forgotPassword = async (req, res) => {
  try {
    if (req.body.user_type == 'eventmanager') {
      const check_email = await UserService.checkEmail(req.body.username)

      if (check_email.length === 0) {
        return res.status(400).json({
          statusCode: statuscode.bad_request,
          error: 'You do not registered. Please signup first',
        })
      }
      var user = await User.findOne({
        username: req.body.username,
      })
      if (user) {
        let check_link = randomstring.generate()
        const data = {
          from: 'contact@carnivalist.com',
          to: req.body.username,
          subject: 'Password Reset Link',
          template: 'forgot-password',
          context: {
            first_name: user.firstName,
            link_url: `${process.env.CLIENT_URL}/reset-password/${check_link}`,
            copyrightYear: new Date().getFullYear(),
          },
        }
        user.randomString = check_link
        user.save()
        transporter.sendMail(data, (err, body) => {
          if (err) {
            return res.json({ error: err.message })
          }
          return res.status(200).json({
            success: true,
            statusCode: statuscode.success,
            message: 'Email has been sent, kindly Follow the instruction',
            data,
          })
        })
      } else {
        return res.status(400).json({
          message: 'User email does not exists',
          statusCode: statuscode.bad_request,
          success: false,
        })
      }

      // await User.findOne({ email: req.body.email, is_deleted: false })
      //   .then(async (user) => {
      //     if (!user) {
      //       return res.status(400).json({
      //         code:statuscode.bad_request,
      //         error: 'User email does not exists',
      //       })
      //     }

      //     let check_link = randomstring.generate()

      //     // let token = jwt.sign(
      //     //   { _id: user._id, email: user.email },
      //     //   process.env.JWT_SECRET,
      //     //   {
      //     //     expiresIn: '10m',
      //     //   }
      //     // )
      //     const data = {
      //       from: 'contact@carnivalist.com',
      //       to: req.body.email,
      //       subject: 'Password Reset Link',
      //       template: 'forgot-password',
      //       context: {
      //         first_name: user.firstName,
      //         link_url: `${process.env.CLIENT_URL}/reset-password/${check_link}`,
      //         copyrightYear: new Date().getFullYear(),
      //       },
      //     }

      //     var forgotUser = await user.updateOne({ check_link: check_link })
      //     if (!forgotUser) {
      //       return res.status(400).json({
      //         code:statuscode.bad_request,
      //         error: 'Reset Password Link Error',
      //       })
      //     } else {
      //       transporter.sendMail(data, (err, body) => {
      //         if (err) {
      //           return res.json({ error: err.message })
      //         }
      //         return res.status(200).json({
      //           success: true,
      //           code:statuscode.success,
      //           message: 'Email has been sent, kindly Follow the instruction',
      //         })
      //       })
      //     }
      //   })
      //   .catch((err) => {
      //     console.log('data', err)
      //     return res
      //       .status(400)
      //       .json({ success: false,code:statuscode.bad_request, message: 'Something went wrong', data: [] })
      //   })
    } else if (
      req.body.user_type == 'staffMember' ||
      req.body.user_type == 'committeeMember'
    ) {
      // console.log('kldfhsdhf', req.body.user_type == 'staffmember' || req.body.user_type == 'committeemember')
      const check_email = await UserStaffService.checkEmail(
        req.body.username,
        req.body.user_type
      )

      if (check_email.length === 0) {
        return res.status(400).json({
          statusCode: statuscode.bad_request,
          error: 'You do not registered. Please signup first',
        })
      }

      var user = await UserStaff.findOne({
        email: req.body.username,
        // is_deleted: false,
      })
      if (user) {
        let check_link = randomstring.generate()
        const data = {
          from: 'contact@carnivalist.com',
          to: req.body.username,
          subject: 'Password Reset Link',
          template: 'forgot-password',
          context: {
            first_name: user.firstName,
            link_url: `${process.env.CLIENT_URL}/reset-password/${check_link}`,
            copyrightYear: new Date().getFullYear(),
          },
        }
        user.randomString = check_link
        user.save()
        transporter.sendMail(data, (err, body) => {
          if (err) {
            return res.json({ error: err.message })
          }
          return res.status(200).json({
            statusCode: statuscode.success,
            success: true,
            message: 'Email has been sent, kindly Follow the instruction',
            data,
          })
        })
      } else {
        return res.status(400).json({
          error: 'User email does not exists',
          statuscode: statuscode.bad_request,
          success: false,
        })
      }
      // if (check_email.length === 0) {
      //   return res.status(400).json({
      //     code:statuscode.bad_request,
      //     error: 'You do not registered. Please signup first',
      //   })
      // }

      //  var user = await User.findOne({email:req.body.email , is_deleted : false})
      // if(user)
      // {
      //   let check_link = randomstring.generate()
      //   const data = {
      //           from: 'contact@carnivalist.com',
      //           to: req.body.email,
      //           subject: 'Password Reset Link',
      //           template: 'forgot-password',
      //           context: {
      //             first_name: user.firstName,
      //             link_url: `${process.env.CLIENT_URL}/reset-password/${check_link}`,
      //             copyrightYear: new Date().getFullYear(),
      //           },
      //         }
      //   user.check_link = check_link
      //   user.save()
      //   transporter.sendMail(data, (err, body) => {
      //     if (err) {
      //       return res.json({ error: err.message })
      //     }
      //     return res.status(200).json({
      //       success: true,
      //       message: 'Email has been sent, kindly Follow the instruction',
      //     })
      //   })
      // }else
      // {
      //   return res.status(400).json({error: 'User email does not exists'})
      // }
    } else {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Something went wrong',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.resetPassword = async (req, res) => {
  try {
    if (req.body.user_type == 'eventmanager') {
      const { resetToken, newPassword, confirmPassword } = req.body

      if (resetToken) {
        // jwt.verify(resetToken, process.env.JWT_SECRET, (err, decoded) => {
        // if (err) {
        //   return res.status(400).json({
        //     error: 'Expired Link. Try again',
        //   })
        // }
        var user = await User.findOne({ randomString: resetToken })
        console.log(user, 'sjbdsbad')

        if (user) {
          bcrypt.hash(newPassword, 12, async (err, hash) => {
            if (err) {
              return res.status(400).json({
                message: err,
                statusCode: statuscode.bad_request,
                success: false,
              })
            } else {
              user.password = hash
              user.randomString = ''
              await user.save()
              return res.status(200).json({
                success: true,
                statusCode: statuscode.success,
                message: 'Password reset successfully',
              })
            }
          })
        } else {
          return res.status(400).json({
            error: 'Something went wrong. Try later',
            statusCode: statuscode.bad_request,
            success: false,
          })
        }
      }

      // User.findOne({ randomstring: resetToken })
      //   .then((user) => {
      //     if (!user) {
      //       return res
      //         .status(400)
      //         .json({ error: 'Something went wrong. Try later',code:statuscode.bad_request })
      //     }
      //     if (newPassword === confirmPassword) {
      //       bcrypt.hash(newPassword, 12, (err, hash) => {
      //         if (err) {
      //           return res.status(400).json({ error: err ,code:statuscode.bad_request})
      //         } else {
      //           user.password = hash
      //           user.randomString = ""
      //           user.save((err, result) => {
      //             if (err) {
      //               return res.status(400).json({ error: err ,code:statuscode.bad_request})
      //             }
      //             return res.status(200).json({
      //               success: true,
      //               code:statuscode.success,
      //               message: 'Password reset successfully',
      //             })
      //           })
      //         }
      //       })
      //     } else {
      //       return res.status(400).json({
      //         code:statuscode.bad_request,
      //         error: 'New password and Confirm password does not match',
      //       })
      //     }
      //   })
      //   .catch((err) => {
      //     console.log('error', err)
      //   })
      // })
      // }
    } else if (
      req.body.user_type == 'staffMember' ||
      req.body.user_type == 'committeeMember'
    ) {
      const { resetToken, newPassword, confirmPassword } = req.body

      if (resetToken) {
        const user = await UserStaff.findOne({ randomString: resetToken })
        if (user) {
          bcrypt.hash(newPassword, 12, async (err, hash) => {
            if (err) {
              return res
                .status(400)
                .json({ error: err, statusCode: statuscode.bad_request })
            } else {
              user.password = hash
              user.randomString = ''
              await user.save()
              return res.status(200).json({
                success: true,
                statusCode: statuscode.success,
                message: 'Password reset successfully',
              })
            }
          })
        } else {
          return res.status(400).json({
            error: 'Something went wrong. Try later',
            statusCode: statuscode.bad_request,
          })
        }

        // jwt.verify(resetToken, process.env.JWT_SECRET, (err, decoded) => {
        // UserStaff.findOne({ randomstring: resetToken })
        //   .then((userStaff) => {
        //     if (!userStaff) {
        //       return res
        //         .status(400)
        //         .json({ error: 'Something went wrong. Try later',code:statuscode.bad_request })
        //     }
        //     if (newPassword === confirmPassword) {
        //       bcrypt.hash(newPassword, 12, (err, hash) => {
        //         if (err) {
        //           return res.status(400).json({ error: err,code:statuscode.bad_request })
        //         } else {
        //           userStaff.password = hash
        //           userStaff.randomString = ""
        //           userStaff.save((err, result) => {
        //             if (err) {
        //               return res.status(400).json({ error: err,code:statuscode.bad_request })
        //             }
        //             return res.status(200).json({
        //               success: true,
        //               code:statuscode.success,
        //               message: 'Password reset successfully',
        //             })
        //           })
        //         }
        //       })
        //     } else {
        //       return res.status(400).json({
        //         code:statuscode.bad_request,
        //         error: 'New password and Confirm password does not match',
        //       })
        //     }
        //   })
        //   .catch((err) => {
        //     console.log('error', err)
        //   })
        // })
      }
    } else {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Something went wrong',
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}

exports.changePassword = async (req, res, next) => {
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

    const user_detail = await UserService.checkEmail(req.user.username)

    if (!bcrypt.compareSync(req.body.old_password, user_detail[0].password)) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message:
          'Your old password was entered incorrectly. Please enter it again',
      })
    }

    var old_password_check = await Constant.passwordCompare(
      user_detail[0].password,
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
        user_detail[0].password,
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

        await UserService.updatePassword(has_new_password_value, req.user.id)
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

exports.updateProfile = async (req, res, next) => {
  try {
    const v = new Validator(req.body, {
      first_name: 'required',
      last_name: 'required',
      username: 'required',
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
    let single_user = await User.findOne({ _id: req.user.id })
    var user_update_data = {
      _id: req.user.id,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      username: req.body.username,
      mobileNumber: req.body.mobile_number,
      facebookUserName: req.body.facebook_username,
      twitterUserName: req.body.twitter_username,
      domainName: req.body.domain_name,
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
      otp: otp,
      isVerified: single_user.isVerified,
      isEmailChanged: false,
      isMobileChanged: false,
    }

    if (req.body.avatar) {
      var upload_photo = await uploadDocument.uploadDocument(req)
      user_update_data.avatar = upload_photo
    }

    // const user = await User.find({ _id: req.user.id })

    // if(req.body.email != user[0].email) {
    //     let token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {expiresIn: '10m'})
    //     const verify_email_data = {
    //         from: "contact@carnivalist.com",
    //         to: req.body.email,
    //         subject: "Email Verification Link",
    //         template: 'profile-email-verification',
    //         context: {
    //             first_name: user[0].firstName,
    //             link_url: `${process.env.CLIENT_URL}/change-email-verify/${token}`,
    //             otp: otp
    //             copyrightYear: new Date().getFullYear()
    //         }
    //     };
    //     transporter.sendMail(verify_email_data)
    // }

    // if(req.body.mobile_number != user[0].mobileNumber) {
    //     const theMessage = await client.messages.create({
    //         body: otp,
    //         from: "+16303608149",//"+14695572198",
    //         to: '+' + req.body.mobile_number
    //     });
    //     await UserService.resendOtp(req.body.email, otp);
    // }

    await UserService.updateUser(user_update_data)

    var all_user = await UserService.getUserProfileData(req.user.id)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: all_user[0],
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.log('Error in update User profile', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getUserProfile = async (req, res) => {
  try {
    var all_user = await UserService.getUserProfileData(req.user.id)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: all_user[0],
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

exports.loginWithGoogle = async (req, res) => {
  try {
    let user = await User.find({ username: req.body.username })
    if (user.length > 0) {
      let update_google_login_data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        username: req.body.username,
        facebookId: req.body.facebookId,
      }
      await UserService.updateUser(update_google_login_data)
      var token = jwt.sign(
        {
          id: user[0]._id,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          username: user[0].username,
          avatar: process.env.PROFILE_IMAGE + user[0].avatar,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )
      var result = {
        token: token,
        id: user[0]._id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        username: user[0].username,
        avatar: process.env.PROFILE_IMAGE + user[0].avatar,
      }
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: result,
        message: 'Login Successfully',
      })
    } else {
      let create_google_login_data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.picture,
        googleId: req.body.googleId,
      }
      let user_create = await UserService.create(create_google_login_data)
      var token = jwt.sign(
        {
          id: user_create._id,
          firstName: user_create.firstName,
          lastName: user_create.lastName,
          username: user_create.username,
          avatar: process.env.PROFILE_IMAGE + user_create.avatar,
          googleId: user_create.googleId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )
      var result = {
        token: token,
        id: user_create._id,
        firstName: user_create.firstName,
        lastName: user_create.lastName,
        username: user_create.username,
        avatar: process.env.PROFILE_IMAGE + user_create.avatar,
        googleId: user_create.googleId,
      }
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: result,
        message: 'Login Successfully',
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

exports.loginWithFacebook = async (req, res) => {
  try {
    let user = await User.find({ username: req.body.username })
    if (user.length > 0) {
      let update_facebook_login_data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        username: req.body.username,
        facebookId: req.body.facebookId,
      }
      await UserService.updateUser(update_facebook_login_data)
      var token = jwt.sign(
        {
          id: user[0]._id,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          username: user[0].username,
          avatar: process.env.PROFILE_IMAGE + user[0].avatar,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )
      var result = {
        token: token,
        id: user[0]._id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        username: user[0].username,
        avatar: process.env.PROFILE_IMAGE + user[0].avatar,
      }
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: result,
        message: 'Login Successfully',
      })
    } else {
      let create_facebook_login_data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        avatar: req.body.picture,
        facebookId: req.body.facebookId,
      }
      let user_create = await UserService.create(create_facebook_login_data)
      var token = jwt.sign(
        {
          id: user_create._id,
          firstName: user_create.firstName,
          lastName: user_create.lastName,
          username: user_create.username,
          avatar: process.env.PROFILE_IMAGE + user_create.avatar,
          facebookId: user_create.facebookId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 2628000, // expires in 1 month
        }
      )
      var result = {
        token: token,
        id: user_create._id,
        firstName: user_create.firstName,
        lastName: user_create.lastName,
        username: user_create.username,
        avatar: process.env.PROFILE_IMAGE + user_create.avatar,
        facebookId: user_create.facebookId,
      }
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: result,
        message: 'Login Successfully',
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

exports.verifyEmail = async (req, res) => {
  try {
    let user = await User.findOne({ randomString: req.params.randomstring })
    if (user) {
      if (Date.now() - user.updatedAt > 1800000) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          expired: true,
          message: 'link is Expired',
          data: {},
        })
      }
      if (user.isVerified == true) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: 'You have already verified in your registered account',
        })
      } else {
        const verify = await UserService.verifyEmail(user.username, user._id)
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Email verified successfully',
          data: verify,
        })
      }
    } else {
      return res.status(400).json({
        success: true,
        statusCode: statuscode.bad_request,
        message: 'This link is already expired please check another email',
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

exports.resendConfirmationEmail = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.userId })
    if (req.body.resendEmailOtp == true) {
      let otp = Math.floor(1000 + Math.random() * 9000)
      let token = jwt.sign(
        { username: req.body.username },
        process.env.JWT_SECRET,
        {
          expiresIn: '10m',
        }
      )
      const verify_email_data = {
        from: 'contact@carnivalist.com',
        to: req.body.username,
        subject: 'Email Verification Link',
        template: 'profile-email-verification',
        context: {
          first_name: user.firstName,
          // link_url: `${process.env.CLIENT_URL}/change-email-verify/${token}`,
          otp: otp,
          copyrightYear: new Date().getFullYear(),
        },
      }
      transporter.sendMail(verify_email_data)
      let data = await UserService.updateEmailVerification(
        req.params.userId,
        otp
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Email Verification Otp Sent successfully',
        data: data,
      })
    } else {
      // let token = jwt.sign(
      //   {
      //     _id: req.params.userId,
      //     email: req.body.email,
      //     isVerified: false,
      //     createdAt: user.createdAt,
      //   },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: '10m',
      //   }
      // )
      let check_link = randomstring.generate()
      const send_email_data = {
        from: 'contact@carnivalist.com',
        to: req.body.username,
        subject: 'Register Confirmation Link',
        template: 'user-email-verification',
        context: {
          first_name: user.firstName,
          link_url: `${process.env.CLIENT_URL}/verify-email/${check_link}`,
          copyrightYear: new Date().getFullYear(),
        },
      }
      user.randomString = check_link
      user.save()
      transporter.sendMail(send_email_data, (err, body) => {
        if (err) {
          return res.json({ error: err.message })
        }
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Email has been sent, kindly Follow the instruction',
        })
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

exports.verifyMobileOtp = async (req, res) => {
  try {
    let user = await User.findOne({
      username: req.body.username,
    })
    if (user && req.body.mobileOtpValue === user.otp) {
      await UserService.verifyMobile(req.body.username, user._id)
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

exports.resendMobileOTP = async (req, res) => {
  try {
    if (req.body.username) {
      let user = await User.findOne({
        username: req.body.username,
      })
      if (user) {
        let otp = Math.floor(1000 + Math.random() * 9000)
        await client.messages.create({
          body: otp,
          from: '+16303608149', //"+14695572198",
          to: user.mobileNumber,
        })
        await UserService.resendOtp(req.body.username, otp)
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Please check otp on your mobile',
        })
      } else {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: 'User not found',
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
        await UserService.sendMobileOtp(req.body.userId, otp)
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Please check otp on your mobile',
        })
      } else {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: 'User not found',
          data: [],
        })
      }
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

exports.getSingleUser = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.userId })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Data retrived successfully',
      data: user,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'User not found',
      data: [],
    })
  }
}

exports.checkEmailVerify = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.userId })
    if (user.isVerified == true) {
      // console.log('dfjkf')
      // return false
      let otp = Math.floor(1000 + Math.random() * 9000)
      await client.messages.create({
        body: otp,
        from: '+16303608149', //"+14695572198",
        to: user.mobileNumber,
      })
      await UserService.resendOtp(user.username, otp)
      return res
        .status(200)
        .json({ success: true, statusCode: statuscode.success })
    } else {
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        message: 'Please verify your email',
        data: [],
      })
    }
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: [],
    })
  }
}

exports.sendProfileVerificationEmail = async (req, res) => {
  try {
    const user = await User.find({ _id: req.user.id })
    let otp = Math.floor(1000 + Math.random() * 9000)
    let token = jwt.sign(
      { username: req.body.username },
      process.env.JWT_SECRET,
      {
        expiresIn: '10m',
      }
    )
    const verify_email_data = {
      from: 'contact@carnivalist.com',
      to: req.body.username,
      subject: 'Email Verification Link',
      template: 'profile-email-verification',
      context: {
        first_name: user[0].firstName,
        link_url: `${process.env.CLIENT_URL}/change-email-verify/${token}`,
        otp: otp,
        copyrightYear: new Date().getFullYear(),
      },
    }
    transporter.sendMail(verify_email_data)
    let data = await UserService.updateEmailVerification(req.user.id, otp)
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

exports.profileEmailVerification = async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.user.id,
    })
    if (user && req.body.otp === user.otp) {
      const verify = await UserService.profileEmailVerification(
        req.user.id,
        req.body.otp,
        req.body.username
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Profile Email Verification successfully',
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

exports.sendProfileMobileOtp = async (req, res) => {
  try {
    let otp = Math.floor(1000 + Math.random() * 9000)
    await client.messages.create({
      body: otp,
      from: '+16303608149', //"+14695572198",
      to: req.body.mobile_number,
    })
    await UserService.sendMobileOtp(req.user.id, otp)
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

exports.verifyProfileMobileOtp = async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.user.id,
    })
    if (user && req.body.mobile_otp_value === user.otp) {
      await UserService.verifyProfileMobile(req.body.mobile_number, req.user.id)
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

exports.resetPasswordLinkExpired = async (req, res) => {
  try {
    const get_event_manager_data = await UserService.getEventManagerData(
      req.params.randomString
    )

    const get_userStaff_data = await UserStaffService.getUserStaffData(
      req.params.randomString
    )

    if (get_event_manager_data) {
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Data retrived successfully',
        data: false,
        userType: 'eventmanager',
      })
    } else if (get_userStaff_data) {
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Data retrived successfully',
        data: false,
        userType: 'staffMember',
      })
    } else {
      return res.status(200).json({
        success: false,
        statusCode: statuscode.success,
        data: true,
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}

// exports.resetPasswordLinkExpired = async (req, res) => {
//   try {
//     var check_email = await UserService.checkResetPasswordLinkExpired(
//       req.body.email
//     );

//     if (check_email.length > 0) {
//       var data = true;
//     } else {
//       var data = false;
//     }

//     return res.status(200).json({
//       success: true,
//       data: data,
//     });
//   } catch (error) {
//     console.log("error", error);
//   }
// };
