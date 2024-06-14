const MarketingGroupService = require('../services/MarketingGroupService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const Subscriber = require('../models/Subscriber')
const MarketingGroup = require('../models/MarketingGroup')
const { default: mongoose } = require('mongoose')
const { statuscode } = require('../config/codeAndMessage')

exports.createMarketingGroup = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      marketing_group_name: 'required',
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

    let marketing_group_data = {
      marketingGroupName: req.body.marketing_group_name,
      userId: req.user.id,
    }

    let create_marketing_group = await MarketingGroupService.create(
      marketing_group_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_marketing_group,
      message: 'Marketing Group Created Successfully',
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

exports.getAllMarketingGroup = async (req, res) => {
  try {
    let get_subscriber
    let get_marketing_group = await MarketingGroupService.getMarketingGroup(
      req.user.id
    )
    get_subscriber = await Subscriber.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: '$marketingGroupId',
          get_subscriber: { $sum: 1 },
        },
      },
    ])
    get_marketing_group = get_marketing_group.map((i) => {
      return {
        ...i,
        count: get_subscriber.reduce(
          (a, b) => a + (b._id.equals(i._id) ? b.get_subscriber : 0),
          0
        ),
      }
    })
    let marketing_group_paginator = await Pagination.paginator(
      get_marketing_group,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: marketing_group_paginator,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('dklfnkld', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.editMarketingGroup = async (req, res) => {
  try {
    const edit_marketing_group = await MarketingGroupService.editMarketingGroup(
      req.params.marketingGroupId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_marketing_group[0],
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

exports.updateMarketingGroup = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      marketing_group_name: 'required',
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

    let marketing_group_data = {
      _id: req.body.id,
      marketingGroupName: req.body.marketing_group_name,
      userId: req.user.id,
    }

    let update_marketing_group = await MarketingGroupService.update(
      marketing_group_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_marketing_group,
      message: 'Marketing Group Updated Successfully',
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

exports.deleteMarketingGroup = async (req, res) => {
  try {
    const delete_marketing_group = await MarketingGroupService.destroy(
      req.params.marketingGroupId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_marketing_group,
      message: 'Marketing Group deleted successfully',
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

exports.getMarketingGroup = async (req, res) => {
  try {
    const get_marketing_group = await MarketingGroup.find({
      userId: req.user.id,
    })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_marketing_group,
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
