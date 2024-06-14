const Coupon = require('../models/Coupon')
const CouponService = require('../services/CouponService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')

exports.createCoupon = async (req, res) => {
  try {
    if (req.body) {
      const validator = new Validator(req.body, {
        code_name: 'required',
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

    let coupon = await CouponService.checkCoupon(
      req.body.code_name,
      req.body.eventId
    )
    if (coupon.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Code name already Exiest',
      })
    }

    let coupon_data = {
      codeName: req.body.code_name,
      ticketLimit: req.body.ticket_limit,
      ticketLimitAmount: req.body.ticket_limit_amount,
      revealHiddenTickets: req.body.reveal_hidden_tickets,
      discountAmount: req.body.discount_amount,
      discountAmountPercentage: req.body.discount_amount_percentage,
      promoCodeStarts: req.body.promo_code_starts,
      startDate: req.body.start_date,
      startTime: req.body.start_time,
      promoCodeEnds: req.body.promo_code_ends,
      expirationDate: req.body.expiration_date,
      expirationTime: req.body.expiration_time,
      allVisibleTickets: req.body.all_visible_tickets,
      onlyCertainTickets: req.body.only_certain_tickets,
      codeType: req.body.code_type,
      numberOfCouponsUse: req.body.number_of_coupons_use,
      eventId: req.body.eventId,
      userId: req.user.id,
      codeUsedFor: req.body.code_used_for,
    }

    let create_coupon = await CouponService.create(coupon_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_coupon,
      message: 'Coupon Created Successfully',
    })
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      statusCode: statuscode.bad_request,
      success: false,
      message: error,
      data: [],
    })
  }
}

exports.getAllCoupons = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : ''

    const all_coupons = await CouponService.getAllCoupons(
      req.query.eventId,
      search
    )

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    const coupon_paginator = await Pagination.paginator(
      all_coupons,
      page,
      limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: coupon_paginator,
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      statusCode: statuscode.bad_request,
      success: false,
      message: error,
      data: [],
    })
  }
}

exports.editCoupon = async (req, res) => {
  try {
    let get_coupon = await CouponService.editCoupon(req.params.couponId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_coupon[0],
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

exports.updateCoupon = async (req, res) => {
  try {
    if (req.body) {
      const validator = new Validator(req.body, {
        code_name: 'required',
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

    let coupon = await CouponService.checkCouponForUpdate(
      req.body.code_name,
      req.body._id,
      req.body.eventId
    )
    if (coupon.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Code name already Exiest',
      })
    }

    let coupon_data = {
      _id: req.body._id,
      codeName: req.body.code_name,
      ticketLimit: req.body.ticket_limit,
      ticketLimitAmount: req.body.ticket_limit_amount,
      revealHiddenTickets: req.body.reveal_hidden_tickets,
      discountAmount: req.body.discount_amount,
      discountAmountPercentage: req.body.discount_amount_percentage,
      promoCodeStarts: req.body.promo_code_starts,
      startDate: req.body.start_date,
      startTime: req.body.start_time,
      promoCodeEnds: req.body.promo_code_ends,
      expirationDate: req.body.expiration_date,
      expirationTime: req.body.expiration_time,
      allVisibleTickets: req.body.all_visible_tickets,
      onlyCertainTickets: req.body.only_certain_tickets,
      codeType: req.body.code_type,
      numberOfCouponsUse: req.body.number_of_coupons_use,
      eventId: req.body.eventId,
      userId: req.user.id,
      codeUsedFor: req.body.code_used_for,
    }

    let update_coupon = await CouponService.update(coupon_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_coupon,
      message: 'Coupon Updated Successfully',
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

exports.deleteCoupon = async (req, res) => {
  try {
    const delete_coupon = await CouponService.destory(req.params.couponId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_coupon,
      message: 'Coupon deleted successfully',
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

exports.getTicketsAndAddons = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : ''
    let get_data = await CouponService.getTicketsAndAddons(
      req.query.eventId,
      req.user.id,
      search
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_data,
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
