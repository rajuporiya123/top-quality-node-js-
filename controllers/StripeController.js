const Stripe = require('stripe')
const User = require('../models/User')
const UserService = require('../services/UserService')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const { statuscode } = require('../config/codeAndMessage')

exports.getStripeState = async (req, res) => {
  try {
    let state = Math.random().toString().split('.')[1]
    const user = await UserService.getState(state, req.user.id)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      state,
      data: user,
      message: 'Get stripe state successfully',
    })
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      data: [],
      message: error.msg,
    })
  }
}

exports.OAuth = async (req, res) => {
  try {
    await stripe.oauth
      .token({
        grant_type: 'authorization_code',
        code: req.body.code,
      })
      .then(async (response) => {
        try {
          var connected_account_id = response.stripe_user_id
          let user = await User.findOne({
            stripeAccountId: connected_account_id,
          })
          if (user) {
            return res.status(400).json({
              success: false,
              statusCode: statuscode.bad_request,
              message:
                'This stripe account is already linked ! with - ' +
                user.firstName +
                ' ' +
                user.lastName,
              data: [],
            })
          }
          user = await User.findByIdAndUpdate(
            req.user.id,
            { stripeAccountId: connected_account_id },
            { new: true }
          )
          return res
            .status(200)
            .json({ success: true, statusCode: statuscode.success, data: user })
        } catch (err) {
          return res.status(400).json({
            success: false,
            statusCode: statuscode.bad_request,
            message: err,
            data: [],
          })
        }
      })
  } catch (err) {
    console.log('sdhfjkds', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getStripeAccountId = async (req, res) => {
  try {
    let get_stripe_account_id = await User.findOne({ _id: req.user.id })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_stripe_account_id,
      message: 'Get stripe id successfully',
    })
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.disconnectStripeAccount = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id })
    const response = await stripe.oauth.deauthorize({
      client_id: process.env.STRIPE_CLIENT_ID,
      stripe_user_id: user.stripeAccountId,
    })
    if (
      response.stripe_user_id &&
      response.stripe_user_id === user.stripeAccountId
    ) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { stripeAccountId: '' },
        { new: true }
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: user,
        message: 'Account disconnect successfully',
      })
    } else {
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        message: err,
        data: 'Something went wrong',
      })
    }
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
