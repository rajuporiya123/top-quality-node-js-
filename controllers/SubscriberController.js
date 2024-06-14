const SubscriberService = require('../services/SubscriberService')
const { Validator } = require('node-input-validator')
const { statuscode } = require('../config/codeAndMessage')

exports.createSubscriber = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: 'required',
      email: 'required',
      country_code: 'required',
      mobile_number: 'required',
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

    let subscriber_data = {
      name: req.body.name,
      email: req.body.email,
      countryCode: req.body.country_code,
      mobileNumber: req.body.mobile_number,
      userId: req.user.id,
      marketingGroupId: req.body.marketingGroupId,
    }

    let create_subscriber = await SubscriberService.create(subscriber_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_subscriber,
      message: 'Subscriber Created Successfully',
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

exports.addMultipleSubscriberFromCSV = async (req, res) => {
  try {
    let subscribers = []
    req.body.data.forEach(async (item) => {
      let add_subscriber = {
        userId: req.user.id,
        marketingGroupId: req.body.marketingGroupId,
        ...item,
      }
      let subscriber = await SubscriberService.create(add_subscriber)
      subscribers.push(subscriber)
    })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Subscribers added Successfully',
      data: subscribers,
    })
  } catch (err) {
    console.log('errr', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getAllSubscriber = async (req, res) => {
  try {
    const get_subscriber = await SubscriberService.getSubscriber(
      req.params.marketingGroupId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_subscriber,
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

exports.editSubscriber = async (req, res) => {
  try {
    const edit_subscriber = await SubscriberService.editSubscriber(
      req.params.subscriberId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_subscriber[0],
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

exports.updateSubscriber = async (req, res) => {
  try {
    let subscriber_data = {
      _id: req.body.subscriberId,
      name: req.body.name,
      email: req.body.email,
      countryCode: req.body.country_code,
      mobileNumber: req.body.mobile_number,
      userId: req.user.id,
      marketingGroupId: req.body.marketingGroupId,
    }

    let update_subscriber = await SubscriberService.update(subscriber_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_subscriber,
      message: 'Subscriber Updated Successfully',
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

exports.deleteSubscriber = async (req, res) => {
  try {
    const delete_subscriber = await SubscriberService.destroy(
      req.params.subscriberId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_subscriber,
      message: 'Subscriber deleted successfully',
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
