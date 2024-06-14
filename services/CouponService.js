const Coupon = require('../models/Coupon')
const Ticket = require('../models/Ticket')
const mongoose = require('mongoose')

module.exports = class AddonService {
  static async checkCoupon(name, eventId) {
    try {
      const checkCoupon = await Coupon.find({ codeName: name, eventId })
      console.log('Coupon Check', checkCoupon)
      return checkCoupon
    } catch (error) {
      console.log(`Could not fetch Coupon ${error}`)
      throw error
    }
  }

  static async create(data) {
    try {
      const create_coupon = await Coupon.create(data)
      return create_coupon
    } catch (error) {
      console.log(`Could not add coupon ${error}`)
      throw error
    }
  }

  static async getAllCoupons(eventId, search) {
    try {
      let regex = new RegExp(search, 'i')
      const get_coupons = await Coupon.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'eventsObject',
          },
        },
        {
          $unwind: '$eventsObject',
        },
        {
          $project: {
            codeName: 1,
            codeType: 1,
            discountAmount: 1,
            discountAmountPercentage: 1,
            ticketLimitAmount: 1,
            endDate: '$eventsObject.endDate',
            endTime: '$eventsObject.endTime',
            eventId: 1,
            expirationDate: 1,
            expirationTime: 1,
            startDate: 1,
            startTime: 1,
            promoCodeStarts: 1,
            promoCodeEnds: 1,
            codeUsedFor: 1,
            createdAt: 1,
            numberOfCouponsUse:1
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            $and: [
              {
                $or: [{ codeName: regex }],
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])

      return get_coupons
    } catch (error) {
      console.log(`Could not get Coupons ${error}`)
      throw error
    }
  }

  static async editCoupon(couponId) {
    try {
      const get_coupon = await Coupon.aggregate([
        {
          $project: {
            codeName: 1,
            ticketLimit: 1,
            ticketLimitAmount: 1,
            revealHiddenTickets: 1,
            discountAmount: 1,
            discountAmountPercentage: 1,
            promoCodeStarts: 1,
            startDate: 1,
            salesStart: 1,
            startDate: 1,
            startTime: 1,
            promoCodeEnds: 1,
            expirationDate: 1,
            expirationTime: 1,
            allVisibleTickets: 1,
            onlyCertainTickets: 1,
            codeType: 1,
            numberOfCouponsUse: 1,
            eventId: 1,
            userId: 1,
            codeUsedFor: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(couponId),
          },
        },
      ])

      return get_coupon
    } catch (error) {
      console.log(`Could not edit coupon ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_coupon = await Coupon.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_coupon
    } catch (error) {
      console.log(`Could not update coupon ${error}`)
      throw error
    }
  }

  static async destory(id) {
    try {
      let coupon_delete_data = await Coupon.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return coupon_delete_data
    } catch (error) {
      console.log('Error in deleting coupon service', error)
      throw error
    }
  }

  static async getTicketsAndAddons(eventId, userId, search) {
    try {
      let regex = new RegExp(search, 'i')

      const ticketData = await Ticket.aggregate([
        {
          $project: {
            name: 1,
            price: 1,
            eventId: 1,
            userId: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            userId: mongoose.Types.ObjectId(userId),
            name: regex,
          },
        },
      ])

      return ticketData
    } catch (error) {
      console.log(`Could not get addon and ticket ${error}`)
      throw error
    }
  }

  static async checkCouponForUpdate(name, id, eventId) {
    try {
      const coupons = await Coupon.find({ eventId })
      const filteredCoupons = coupons.filter(
        (coupon) => coupon._id.toString() !== id
      )
      const checkCoupon = filteredCoupons.filter((c) => c.codeName === name)
      return checkCoupon
    } catch (error) {
      console.log(`Could not fetch Coupon ${error}`)
      throw error
    }
  }
}
