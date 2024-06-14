const TextMessageGroupService = require('../services/TextMessageGroupService')
const { Validator } = require('node-input-validator')
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const { statuscode } = require('../config/codeAndMessage')

exports.createTextMessageGroup = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      group_name: 'required',
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

    let create_text_message_group = {
      groupName: req.body.group_name,
      phoneNumber: req.body.phone_number,
      userId: req.user.id,
    }

    let message_group = await TextMessageGroupService.create(
      create_text_message_group
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: message_group,
      message: 'Text Message Group Created Successfully',
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

exports.getAllTextMessageGroup = async (req, res) => {
  try {
    const get_text_message_group =
      await TextMessageGroupService.getTextMessageGroup(req.user.id)
    // let text_message_group_paginator = await Pagination.paginator(get_text_message_group, req.body.page, req.body.limit)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_text_message_group,
      message: 'Data retrived successfully',
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

exports.deleteTextMessageGroup = async (req, res) => {
  try {
    const delete_text_message_service = await TextMessageGroupService.destroy(
      req.params.messageGroupId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_text_message_service,
      message: 'Text Message Group deleted successfully',
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

exports.sendTextMessage = async (req, res) => {
  try {
    let mobile_number_array = []
    for (var i = 0; i <= req.body.mobile_number.length - 1; i++) {
      let send_text_message = await client.messages.create({
        from: '+16303608149', //"+14695572198",
        to: req.body.mobile_number[i],
        body: req.body.message + ' from this ' + req.body.event_title,
      })
      mobile_number_array.push(send_text_message)
    }
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Text Message Send successfully',
    })
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: 'Something went wrong',
      data: [],
    })
  }
}

exports.getAllEventForTextMessageGroup = async (req, res) => {
  try {
    var get_event_for_text_message_group =
      await TextMessageGroupService.getAllEventForTextMessageGroup(req.user.id)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_event_for_text_message_group,
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

exports.getSingleTextMessageGroup = async (req, res) => {
  try {
    var get_single_text_message_group =
      await TextMessageGroupService.getSingleTextMessageGroup(
        req.params.groupId
      )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_single_text_message_group[0],
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

exports.editTextMessageGroup = async (req, res) => {
  try {
    var edit_text_message_group =
      await TextMessageGroupService.editTextMessageGroup(
        req.params.messageGroupId
      )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_text_message_group,
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

exports.updateTextMessageGroup = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      group_name: 'required',
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

    let update_text_message_group = {
      _id: req.body.groupId,
      groupName: req.body.group_name,
      phoneNumber: req.body.phone_number,
      userId: req.user.id,
    }

    let update_message_group = await TextMessageGroupService.update(
      update_text_message_group
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_message_group,
      message: 'Text Message Group Updated Successfully',
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
