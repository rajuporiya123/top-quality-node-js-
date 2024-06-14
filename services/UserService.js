const User = require('../models/User')
const mongoose = require('mongoose')

module.exports = class UserService {
  static async create(data) {
    try {
      const create_user = await User.create(data)
      return create_user
    } catch (error) {
      console.log(`Could not add user ${error}`)
      throw error
    }
  }

  static async checkEmail(username) {
    try {
      const checkEmail = await User.find({ username: username ,userType:"manager"})
      return checkEmail
    } catch (error) {
      console.log(`Could not fetch user email ${error}`)
      throw error
    }
  }

  static async checkPassword(data) {
    try {
      const check_password = await User.findOne({ _id: data })
      return check_password
    } catch (error) {
      console.log(`Could not fetch password Data ${error}`)
      throw error
    }
  }

  static async updatePassword(password, user_id) {
    try {
      var user_password_update = await User.updateOne(
        { _id: user_id },
        { password: password }
      )
      return user_password_update
    } catch (error) {
      console.log(`Error in update password ${error}`)
      throw error
    }
  }

  static async updateUser(update_data) {
    try {
      let update_user_data = await User.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_user_data
    } catch (error) {
      console.log('Error in update user', error)
      throw error
    }
  }

  static async getUserProfileData(userId) {
    try {
      var aggregate = await User.aggregate([
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            username: 1,
            avatar: { $concat: [process.env.PROFILE_IMAGE, '$avatar'] },
            mobileNumber: 1,
            facebookUserName: 1,
            twitterUserName: 1,
            // domainName: {
            //   $concat: ['https://', '$domainName', '.carnivalist.com'],
            // },
            domainName: 1,
            stripeState: 1,
            stripeAccountId: 1,
            isEmailChanged: 1,
            isMobileChanged: 1,
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
            _id: mongoose.Types.ObjectId(userId),
          },
        },
      ])
      return aggregate
    } catch (error) {
      console.log('Get User Profile Data Error', error)
      throw error
    }
  }

  static async verifyEmail(username, userId) {
    try {
      let verify_email_data = await User.findByIdAndUpdate(userId, {
        $set: { username: username, isVerified: true },
      })
      return verify_email_data
    } catch (error) {
      console.log('Error in verify email', error)
      throw error
    }
  }

  static async verifyMobile(username, userId) {
    try {
      let verify_mobile_data = await User.findByIdAndUpdate(userId, {
        $set: { username: username, isMobileVerified: true },
      })
      return verify_mobile_data
    } catch (error) {
      console.log('Error in verify mobile', error)
      throw error
    }
  }

  static async resendOtp(username, otp) {
    try {
      let resend_otp = await User.updateOne(
        { username: username },
        { otp: otp }
      )
      return resend_otp
    } catch (error) {
      console.log('Error in resend otp', error)
      throw error
    }
  }

  static async getState(state, userId) {
    try {
      let stripe_state = await User.findByIdAndUpdate(userId, {
        $set: { stripeState: state },
      })
      return stripe_state
    } catch (error) {
      console.log('Error in get stripe state', error)
      throw error
    }
  }

  static async profileEmailVerification(userId, otp, username) {
    try {
      // let profile_email_verification_data = await User.findByIdAndUpdate(userId, {
      //     $set: { otp: otp, isVerified: true, isEmailChanged: true }
      // });
      let profile_email_verification_data = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            otp: otp,
            isVerified: true,
            isEmailChanged: false,
            username: username,
          },
        }
      )
      return profile_email_verification_data
    } catch (error) {
      console.log('Error in profile email verification', error)
      throw error
    }
  }

  static async updateEmailVerification(userId, otp) {
    try {
      // let update_email_verification = await User.findByIdAndUpdate(userId, {
      //     $set: { isVerified: false, otp: otp }
      // });
      let update_email_verification = await User.findByIdAndUpdate(userId, {
        $set: { otp: otp },
      })
      return update_email_verification
    } catch (error) {
      console.log('Error in update email verification', error)
      throw error
    }
  }

  static async verifyProfileMobile(mobile_number, userId) {
    try {
      let verify_profile_mobile_data = await User.findByIdAndUpdate(userId, {
        $set: {
          mobileNumber: mobile_number,
          isMobileVerified: true,
          isMobileChanged: true,
        },
      })
      return verify_profile_mobile_data
    } catch (error) {
      console.log('Error in verify profile mobile', error)
      throw error
    }
  }

  static async sendMobileOtp(userId, otp) {
    try {
      let send_otp = await User.findByIdAndUpdate(userId, {
        $set: { otp: otp },
      })
      return send_otp
    } catch (error) {
      console.log('Error in send otp', error)
      throw error
    }
  }

  static async getEventManagerData(randomString) {
    try {
      var get_event_manager = await User.findOne({ randomString: randomString })
      return get_event_manager
    } catch (error) {
      console.log('Get Event Manager Data Error', error)
      throw error
    }
  }

  static async checkResetPasswordLinkExpired(username) {
    try {
      const check_value = await User.find({
        username: username,
        randomString: '',
      })
      return check_value
    } catch (error) {
      console.log(`Could not fetch reset password link expired Data ${error}`)
      throw error
    }
  }
}
