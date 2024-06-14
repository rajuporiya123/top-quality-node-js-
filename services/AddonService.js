const Addon = require('../models/Addon')
const mongoose = require('mongoose')

module.exports = class AddonService {
  static async create(data) {
    try {
      const create_addon = await Addon.create(data)
      return create_addon
    } catch (error) {
      console.log(`Could not add addon ${error}`)
      throw error
    }
  }

  static async getAddons(eventId) {
    try {
      const get_addons = await Addon.aggregate([
        {
          $project: {
            name: 1,
            price: 1,
            totalQuantity: 1,
            soldUnits: 1,
            startDate: 1,
            startTime: 1,
            endDate: 1,
            endTime: 1,
            eventId: 1,
            ticketSaleType: 1,
            isVariation: 1,
            ticketSaleType: 1,
            ticketOption: 1,
            createdAt: 1,
            'variations.addonId': '$_id',
            'variations.variationName': 1,
            'variations.variationQuantity': 1,
            'variations.price': 1,
            'variations.absorbFees': 1,
            'variations.description': 1,
            'variations.soldUnits': 1,
            'variations.image': 1,
            'variations.detailsForConfirmationEmail': 1,
            'variations.minimumQuantity': 1,
            'variations.maximumQuantity': 1,
            'variations.salesStart': 1,
            'variations.ticketSaleType': 1,
            'variations.startDate': 1,
            'variations.startTime': 1,
            'variations.endDate': 1,
            'variations.endTime': 1,
            'variations.visibility': 1,
            'variations.salesChannel': 1,
            'variations.ticketSaleType': 1,
            'variations.ticketOption': 1,
            'variations._id': 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])

      get_addons.map(async (t) => {
        if (t.isVariation == true) {
          t.variations.map(async (t) => {
            const startDay = t.startDate.getDate()
            const startMonth = t.startDate.getMonth() + 1
            const startYear = t.startDate.getFullYear()
            let startHour = parseInt(t.startTime.split(':')[0])
            const startPmam = t.startTime.slice(-2)
            if (startPmam == 'PM') {
              startHour = startHour + 12
            }
            const startMin = parseInt(t.startTime.split(':')[1].split(' ')[0])
            const endDay = t.endDate.getDate()
            const endMonth = t.endDate.getMonth() + 1
            const endYear = t.endDate.getFullYear()
            let endHour = parseInt(t.endTime.split(':')[0])
            const endPmam = t.endTime.slice(-2)
            if (endPmam == 'PM') {
              endHour = endHour + 12
            }
            const endMin = parseInt(t.endTime.split(':')[1].split(' ')[0])

            let nowDate = new Date()
            const nowDay = nowDate.getDate()
            const nowMonth = nowDate.getMonth() + 1
            const nowYear = nowDate.getFullYear()
            const nowHours = nowDate.getHours()
            const nowMin = nowDate.getMinutes()
            const finalNowDate = new Date(
              nowYear,
              nowMonth,
              nowDay,
              nowHours,
              nowMin,
              0
            )
            const finalStartDate = new Date(
              startYear,
              startMonth,
              startDay,
              startHour,
              startMin,
              0
            )
            const finalEndDate = new Date(
              endYear,
              endMonth,
              endDay,
              endHour,
              endMin,
              0
            )

            if (finalNowDate.getTime() < finalStartDate.getTime()) {
              t.ticketSaleType = 'Scheduled'
            } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
              t.ticketSaleType = 'Ended'
            } else if (
              finalStartDate.getTime() <= finalNowDate.getTime() &&
              finalEndDate.getTime() > finalNowDate.getTime()
            ) {
              t.ticketSaleType = 'On Sale'
            }
          })
        } else {
          const startDay = t.startDate.getDate()
          const startMonth = t.startDate.getMonth() + 1
          const startYear = t.startDate.getFullYear()
          let startHour = parseInt(t.startTime.split(':')[0])
          const startPmam = t.startTime.slice(-2)
          if (startPmam == 'PM') {
            startHour = startHour + 12
          }
          const startMin = parseInt(t.startTime.split(':')[1].split(' ')[0])
          const endDay = t.endDate.getDate()
          const endMonth = t.endDate.getMonth() + 1
          const endYear = t.endDate.getFullYear()
          let endHour = parseInt(t.endTime.split(':')[0])
          const endPmam = t.endTime.slice(-2)
          if (endPmam == 'PM') {
            endHour = endHour + 12
          }
          const endMin = parseInt(t.endTime.split(':')[1].split(' ')[0])

          let nowDate = new Date()
          const nowDay = nowDate.getDate()
          const nowMonth = nowDate.getMonth() + 1
          const nowYear = nowDate.getFullYear()
          const nowHours = nowDate.getHours()
          const nowMin = nowDate.getMinutes()
          const finalNowDate = new Date(
            nowYear,
            nowMonth,
            nowDay,
            nowHours,
            nowMin,
            0
          )
          const finalStartDate = new Date(
            startYear,
            startMonth,
            startDay,
            startHour,
            startMin,
            0
          )
          const finalEndDate = new Date(
            endYear,
            endMonth,
            endDay,
            endHour,
            endMin,
            0
          )

          if (finalNowDate.getTime() < finalStartDate.getTime()) {
            t.ticketSaleType = 'Scheduled'
          } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
            t.ticketSaleType = 'Ended'
          } else if (
            finalStartDate.getTime() <= finalNowDate.getTime() &&
            finalEndDate.getTime() > finalNowDate.getTime()
          ) {
            t.ticketSaleType = 'On Sale'
          }
        }
      })

      return get_addons
    } catch (error) {
      console.log(`Could not get Addons ${error}`)
      throw error
    }
  }

  static async editAddon(addonId, image) {
    try {
      let get_addon
      if (image === '') {
        get_addon = await Addon.aggregate([
          {
            $project: {
              name: 1,
              totalQuantity: 1,
              price: 1,
              description: 1,
              detailsForConfirmationEmail: 1,
              absorbFees: 1,
              minimumQuantity: 1,
              maximumQuantity: 1,
              salesStart: 1,
              startDate: 1,
              image: 1,
              startTime: 1,
              endDate: 1,
              endTime: 1,
              visibility: 1,
              salesChannel: 1,
              eventId: 1,
              userId: 1,
              ticketSaleType: 1,
              ticketOption: 1,
              isVariation: 1,
              soldUnits: 1,
              variations: 1,
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(addonId),
            },
          },
        ])
      } else {
        get_addon = await Addon.aggregate([
          {
            $project: {
              name: 1,
              totalQuantity: 1,
              price: 1,
              description: 1,
              detailsForConfirmationEmail: 1,
              image: { $concat: [process.env.ADDON_IMAGE, '$image'] },
              absorbFees: 1,
              minimumQuantity: 1,
              maximumQuantity: 1,
              salesStart: 1,
              startDate: 1,
              startTime: 1,
              endDate: 1,
              endTime: 1,
              visibility: 1,
              salesChannel: 1,
              eventId: 1,
              userId: 1,
              ticketSaleType: 1,
              ticketOption: 1,
              isVariation: 1,
              soldUnits: 1,
              variations: 1,
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(addonId),
            },
          },
        ])
      }
      return get_addon
    } catch (error) {
      console.log(`Could not edit addon ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_addon = await Addon.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_addon
    } catch (error) {
      console.log(`Could not update addon ${error}`)
      throw error
    }
  }

  static async destory(id) {
    try {
      let addon_delete_data = await Addon.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return addon_delete_data
    } catch (error) {
      console.log('Error in deleting addon service', error)
      throw error
    }
  }

  static async destroyVariation(addonId, variationId) {
    try {
      let variation_delete_data = await Addon.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(addonId) },
        {
          $pull: { variations: { _id: mongoose.Types.ObjectId(variationId) } },
        }
      )

      return variation_delete_data
    } catch (error) {
      console.log('Error in deleting variation service', error)
      throw error
    }
  }

  static async editVariation(addonId, variationId) {
    try {
      const get_variation = await Addon.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(addonId),
          },
        },
        {
          $project: {
            filtered: {
              $filter: {
                input: '$variations',
                as: 'variation',
                cond: {
                  $eq: [
                    '$$variation._id',
                    mongoose.Types.ObjectId(variationId),
                  ],
                },
              },
            },
          },
        },
      ])

      return get_variation
    } catch (error) {
      console.log(`Could not edit variation ${error}`)
      throw error
    }
  }
  static async updateVariation(addonId, variationId, data) {
    try {
      const update_variation = await Addon.updateOne(
        {
          _id: mongoose.Types.ObjectId(addonId),
          'variations._id': mongoose.Types.ObjectId(variationId),
        },
        {
          $set: {
            'variations.$.variationName': data.variationName,
            'variations.$.variationQuantity': data.variationQuantity,
            'variations.$.price': data.price,
            'variations.$.absorbFees': data.absorbFees,
            'variations.$.description': data.description,
            'variations.$.soldUnits': data.soldUnits,
            'variations.$.image': data.image,
            'variations.$.detailsForConfirmationEmail':
              data.detailsForConfirmationEmail,
            'variations.$.minimumQuantity': data.minimumQuantity,
            'variations.$.maximumQuantity': data.maximumQuantity,
            'variations.$.salesStart': data.salesStart,
            'variations.$.ticketSaleType': data.ticketSaleType,
            'variations.$.startDate': data.startDate,
            'variations.$.startTime': data.startTime,
            'variations.$.endDate': data.endDate,
            'variations.$.endTime': data.endTime,
            'variations.$.visibility': data.visibility,
            'variations.$.salesChannel': data.salesChannel,
            'variations.$.ticketOption': data.ticketOption,
          },
        }
      )
      return update_variation
    } catch (error) {
      console.log(`Could not update variation ${error}`)
      throw error
    }
  }

  static async checkAddon(name, eventId) {
    try {
      const checkAddon = await Addon.find({ name, eventId })
      console.log('Addon Check', checkAddon)
      return checkAddon
    } catch (error) {
      console.log(`Could not fetch Addon ${error}`)
      throw error
    }
  }

  static async checkAddonForUpdate(name, id, eventId) {
    try {
      const addons = await Addon.find({ eventId })
      const filteredAddons = addons.filter(
        (addon) => addon._id.toString() !== id
      )
      const checkAddon = filteredAddons.filter((c) => c.name === name)
      return checkAddon
    } catch (error) {
      console.log(`Could not fetch Addons ${error}`)
      throw error
    }
  }

  static async getAddonOption(eventId) {
    try {
      const get_addon_details = await Addon.aggregate([
        {
          $project: {
            name: 1,
            price: 1,
            eventId: 1,
            isVariation: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            isVariation: false,
          },
        },
      ])

      const get_variation_details = await Addon.aggregate([
        {
          $project: {
            variationsNames: '$variations.variationName',
            variationPrices: '$variations.price',
            eventId: 1,
            isVariation: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            isVariation: true,
          },
        },
      ])
      return { get_addon_details, get_variation_details }
    } catch (error) {
      console.log(`Could not get addon option ${error}`)
      throw error
    }
  }
}
