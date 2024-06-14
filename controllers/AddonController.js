const Addon = require('../models/Addon')
const AddonService = require('../services/AddonService')
const { Validator } = require('node-input-validator')
const uploadDocument = require('../config/config')
const Pagination = require('../config/config')
const randomstring = require('randomstring')
const fs = require('fs')
const { default: mongoose } = require('mongoose')
const { statuscode } = require('../config/codeAndMessage')
const { imageUpload } = require('../config/config')

exports.createAddon = async (req, res) => {
  try {
    let addon = await AddonService.checkAddon(req.body.name, req.body.eventId)
    if (addon.length > 0) {
      return res.status(400).json({
        data: [],
        success: false,
        message: 'Addon name already exists',
      })
    }

    if (req.body.isVariation == true) {
      const addon_dir = 'public/addon'
      if (!fs.existsSync(addon_dir)) {
        fs.mkdirSync(addon_dir)
      }

      if (req.body.image) {
        req.body.image = await imageUpload(req.body.image, addon_dir)
        // const image_type = req.body.image.split(';')[0].split('/')[1]
        // const file_name = 'addon' + randomstring.generate()
        // const uplodedImage = await ImageUpload.imageUpload(
        //   req.body.image,
        //   addon_dir,
        //   file_name,
        //   image_type
        // )
        // req.body.image = uplodedImage
      }

      if (req.body.variations.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            'At least two variations required. Add more varieties or uncheck setting below.',
          data: [],
        })
      }
      for (var i = 0; i <= req.body.variations.length - 1; i++) {
        if (req.body.variations[i].image) {
          req.body.variations[i].image = await imageUpload(
            req.body.variations[i].image,
            addon_dir
          )

          // const image_type = req.body.variations[i].image
          //   .split(';')[0]
          //   .split('/')[1]
          // const file_name = 'addon' + randomstring.generate()
          // const uplodedImage = await ImageUpload.imageUpload(
          //   req.body.variations[i].image,
          //   addon_dir,
          //   file_name,
          //   image_type
          // )
          // req.body.variations[i].image = uplodedImage
        }

        //for ticketSaleType in variations-----------------------------------------------------------------

        if (req.body.variations[i].salesStart == 'Dateandtime') {
          const finalStartDate = new Date(
            `${req.body.variations[i].startDate} ${req.body.variations[i].startTime}`
          )

          const finalEndDate = new Date(
            `${req.body.variations[i].endDate} ${req.body.variations[i].endTime}`
          )

          const finalNowDate = new Date()

          if (finalNowDate.getTime() < finalStartDate.getTime()) {
            req.body.variations[i].ticketSaleType = 'Scheduled'
          } else if (
            finalStartDate.getTime() <= finalNowDate.getTime() &&
            finalEndDate.getTime() > finalNowDate.getTime()
          ) {
            req.body.variations[i].ticketSaleType = 'On Sale'
          } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
            req.body.variations[i].ticketSaleType = 'Ended'
          }
        } else {
          req.body.variations[i].ticketSaleType = 'Scheduled'
        }

        //-------------------------------------------------------------------------------------------------
      }

      let create_addon = await Addon.create(req.body)

      return res.status(200).json({
        success: true,
        data: create_addon,
        message: 'Addon Created Successfully',
      })
    } else {
      const validator = new Validator(req.body, {
        name: 'required',
        totalQuantity: 'required',
        minimumQuantity: 'required',
        maximumQuantity: 'required',
        endDate: 'required',
        endTime: 'required',
      })

      const matched = await validator.check()
      console.log('matched ? ', matched)
      if (!matched) {
        return res.status(400).json({
          data: [],
          success: false,
          message: validator.errors,
        })
      }

      //for ticketSaleType in addon---------------------------------------------------------------------

      if (req.body.salesStart == 'Dateandtime') {
        const finalStartDate = new Date(
          `${req.body.startDate} ${req.body.startTime}`
        )

        const finalEndDate = new Date(`${req.body.endDate} ${req.body.endTime}`)

        let finalNowDate = new Date()

        if (finalNowDate.getTime() < finalStartDate.getTime()) {
          req.body.ticketSaleType = 'Scheduled'
        } else if (
          finalStartDate.getTime() <= finalNowDate.getTime() &&
          finalEndDate.getTime() > finalNowDate.getTime()
        ) {
          req.body.ticketSaleType = 'On Sale'
        } else if (finalNowDate.getTime() > finalEndDate.getTime()) {
          req.body.ticketSaleType = 'Ended'
        }
      } else {
        req.body.ticketSaleType = 'Scheduled'
      }

      //-------------------------------------------------------------------------------------------------

      if (req.body.image) {
        const addon_dir = 'public/addon'
        if (!fs.existsSync(addon_dir)) {
          fs.mkdirSync(addon_dir)
        }

        req.body.image = await imageUpload(req.body.image, addon_dir)

        // const image_type = req.body.image.split(';')[0].split('/')[1]
        // const file_name = 'addon' + randomstring.generate()
        // const uplodedImage = await ImageUpload.imageUpload(
        //   req.body.image,
        //   addon_dir,
        //   file_name,
        //   image_type
        // )
        // req.body.image = uplodedImage
      }

      let create_addon = await Addon.create(req.body)

      return res.status(200).json({
        success: true,
        data: create_addon,
        message: 'Addon Created Successfully',
      })
    }
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({ success: false, message: error, data: [] })
  }
}

exports.getAllAddons = async (req, res) => {
  try {
    const get_addons = await AddonService.getAddons(req.query.eventId)
    let addons_paginator = await Pagination.paginator(
      get_addons,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statuscode: statuscode.success,
      data: addons_paginator,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err,
      data: [],
    })
  }
}

exports.editAddon = async (req, res) => {
  try {
    let addon = await Addon.findById({ _id: req.params.addonId })
    let get_addon = await AddonService.editAddon(
      req.params.addonId,
      addon.image
    )
    return res.status(200).json({
      success: true,
      statuscode: statuscode.success,
      data: get_addon[0],
      link: process.env.ADDON_IMAGE,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err,
      data: [],
    })
  }
}

exports.updateAddon = async (req, res) => {
  try {
    let addon = await AddonService.checkAddonForUpdate(
      req.body.name,
      req.body._id,
      req.body.eventId
    )
    if (addon.length > 0) {
      return res.status(400).json({
        data: [],
        statuscode: statuscode.bad_request,
        success: false,
        message: 'Addon name already exists',
      })
    }

    if (req.body.isVariation == true) {
      const addon_dir = 'public/addon'
      if (!fs.existsSync(addon_dir)) {
        fs.mkdirSync(addon_dir)
      }

      if (req.body.image) {
        req.body.image = await imageUpload(req.body.image, addon_dir)

        // const image_type = req.body.image.split(';')[0].split('/')[1]
        // const file_name = 'addon' + randomstring.generate()
        // const uplodedImage = await ImageUpload.imageUpload(
        //   req.body.image,
        //   addon_dir,
        //   file_name,
        //   image_type
        // )
        // req.body.image = uplodedImage
      }

      if (req.body.variations.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            'At least two variations required. Add more varieties or uncheck setting below.',
          data: [],
        })
      }
      for (var i = 0; i <= req.body.variations.length - 1; i++) {
        if (req.body.variations[i].image) {
          req.body.variations[i].image = await imageUpload(
            req.body.variations[i].image,
            addon_dir
          )

          // const image_type = req.body.variations[i].image
          //   .split(';')[0]
          //   .split('/')[1]
          // const file_name = 'addon' + randomstring.generate()
          // const uplodedImage = await ImageUpload.imageUpload(
          //   req.body.variations[i].image,
          //   addon_dir,
          //   file_name,
          //   image_type
          // )
          // req.body.variations[i].image = uplodedImage
        }

        //for ticketSaleType in variations-----------------------------------------------------------------

        if (req.body.variations[i].salesStart == 'Dateandtime') {
          const finalStartDate = new Date(
            `${req.body.variations[i].startDate} ${req.body.variations[i].startTime}`
          )

          const finalEndDate = new Date(
            `${req.body.variations[i].endDate} ${req.body.variations[i].endTime}`
          )

          const finalNowDate = new Date()

          if (finalNowDate.getTime() < finalStartDate.getTime()) {
            req.body.variations[i].ticketSaleType = 'Scheduled'
          } else if (
            finalStartDate.getTime() <= finalNowDate.getTime() &&
            finalEndDate.getTime() > finalNowDate.getTime()
          ) {
            req.body.variations[i].ticketSaleType = 'On Sale'
          } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
            req.body.variations[i].ticketSaleType = 'Ended'
          }
        } else {
          req.body.variations[i].ticketSaleType = 'Scheduled'
        }

        //-------------------------------------------------------------------------------------------------
      }

      let update_addon = await Addon.updateOne(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        req.body
      )

      return res.status(200).json({
        success: true,
        statuscode: statuscode.success,
        data: update_addon,
        message: 'Addon Updated Successfully',
      })
    } else {
      const validator = new Validator(req.body, {
        name: 'required',
        totalQuantity: 'required',
        minimumQuantity: 'required',
        maximumQuantity: 'required',
        endDate: 'required',
        endTime: 'required',
      })

      const matched = await validator.check()
      console.log('matched ? ', matched)
      if (!matched) {
        return res.status(400).json({
          data: [],
          success: false,
          message: validator.errors,
        })
      }

      //for ticketSaleType in addon---------------------------------------------------------------------

      if (req.body.salesStart == 'Dateandtime') {
        const finalStartDate = new Date(
          `${req.body.startDate} ${req.body.startTime}`
        )

        const finalEndDate = new Date(`${req.body.endDate} ${req.body.endTime}`)

        let finalNowDate = new Date()

        if (finalNowDate.getTime() < finalStartDate.getTime()) {
          req.body.ticketSaleType = 'Scheduled'
        } else if (
          finalStartDate.getTime() <= finalNowDate.getTime() &&
          finalEndDate.getTime() > finalNowDate.getTime()
        ) {
          req.body.ticketSaleType = 'On Sale'
        } else if (finalNowDate.getTime() > finalEndDate.getTime()) {
          req.body.ticketSaleType = 'Ended'
        }
      } else {
        req.body.ticketSaleType = 'Scheduled'
      }

      //-------------------------------------------------------------------------------------------------

      if (req.body.image) {
        const addon_dir = 'public/addon'
        if (!fs.existsSync(addon_dir)) {
          fs.mkdirSync(addon_dir)
        }

        req.body.image = await imageUpload(req.body.image, addon_dir)
        // const image_type = req.body.image.split(';')[0].split('/')[1]
        // const file_name = 'addon' + randomstring.generate()
        // const uplodedImage = await ImageUpload.imageUpload(
        //   req.body.image,
        //   addon_dir,
        //   file_name,
        //   image_type
        // )
        // req.body.image = uplodedImage
      }

      let update_addon = await Addon.updateOne(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        req.body
      )

      return res.status(200).json({
        success: true,
        statuscode: statuscode.success,
        data: update_addon,
        message: 'Addon Updated Successfully',
      })
    }
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({ success: false, message: error, data: [] })
  }
}

exports.deleteAddon = async (req, res) => {
  try {
    const addonDetails = await Addon.aggregate([
      {
        $project: {
          name: 1,
          eventId: 1,
          _id: 1,
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.addonId),
        },
      },
    ])

    const matchAddon = await Addon.aggregate([
      {
        $project: {
          name: 1,
          ticketOption: 1,
          eventId: 1,
        },
      },
      {
        $match: {
          eventId: addonDetails[0]?.eventId,
          ticketOption: addonDetails[0]?.name,
        },
      },
    ])

    if (matchAddon.length == 0) {
      const delete_addon = await AddonService.destory(req.params.addonId)
      return res.status(200).json({
        success: true,
        statuscode: statuscode.success,
        data: delete_addon,
        message: 'Addon deleted successfully',
      })
    } else {
      return res.status(400).json({
        success: false,
        statuscode: statuscode.bad_request,
        data: [],
        message:
          'Another ticket class is configured to start when this one ends, so it cannot be deleted.',
      })
    }
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err,
      data: [],
    })
  }
}

exports.deleteVariation = async (req, res) => {
  try {
    const delete_variation = await AddonService.destroyVariation(
      req.query.addonId,
      req.query.variationId
    )
    return res.status(200).json({
      success: true,
      statuscode: statuscode.success,
      data: delete_variation,
      message: 'Addon variation deleted successfully',
    })
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err,
      data: [],
    })
  }
}

exports.editVariation = async (req, res) => {
  try {
    console.log(req.query, '<<<<<<<>>>>>>>>>>>')
    let get_variation = await AddonService.editVariation(
      req.query.addonId,
      req.query.variationId
    )
    return res.status(200).json({
      success: true,
      data: get_variation[0],
      statuscode: statuscode.success,
      link: process.env.ADDON_IMAGE,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('<<<<<<<<<<<<first>>>>>>>>>>>>')
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err.message,
      data: [],
    })
  }
}

exports.updateVariation = async (req, res) => {
  try {
    const addon_dir = 'public/addon'
    if (req.body.image != '') {
      req.body.image = await imageUpload(req.body.image, addon_dir)

      // var image_type = req.body.image.split(';')[0].split('/')[1]
      // const file_name = 'addon' + randomstring.generate()
      // const uplodedImage = await ImageUpload.imageUpload(
      //   req.body.image,
      //   addon_dir,
      //   file_name,
      //   image_type
      // )
      // req.body.image = uplodedImage
    }

    const data = req.body

    let update_variation = await AddonService.updateVariation(
      req.body.addonId,
      req.body.variationId,
      data
    )
    return res.status(200).json({
      success: true,
      statuscode: statuscode.success,
      data: update_variation,
      message: 'Variation updated successfully',
    })
  } catch (err) {
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err.message,
      data: [],
    })
  }
}

exports.getAddonOption = async (req, res) => {
  try {
    const addon_option = await AddonService.getAddonOption(req.params.eventId)

    let final = []
    const addon_details = addon_option.get_addon_details
    const variation_details = addon_option.get_variation_details
    final = [...addon_details]
    variation_details.map((v) => {
      Flength = final.length
      v.variationsNames.map((v1) => {
        let obj = {}
        obj.name = v1
        obj.isVariation = true
        final.push(obj)
      })
      v.variationPrices.map((v2, i) => {
        final[Flength + i].price = v2
      })
    })
    return res.status(200).json({
      success: true,
      statuscode: statuscode.success,
      data: final,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      statuscode: statuscode.bad_request,
      success: false,
      message: err.message,
      data: [],
    })
  }
}
