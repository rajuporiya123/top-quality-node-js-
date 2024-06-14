const Organizer = require('../models/Organizer')
const Event = require('../models/Event')
const OrganizerService = require('../services/OrganizerService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const uploadOrganizerProfileImage = require('../config/config')
const path = require('path')
const fs = require('fs')
const { statuscode } = require('../config/codeAndMessage')

exports.createOrganizer = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      organizer_name: 'required',
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

    let organizer_data = {
      organizerName: req.body.organizer_name,
      website: req.body.website,
      organizerBio: req.body.organizer_bio,
      description: req.body.description,
      facebookId: req.body.facebookId,
      twitterId: req.body.twitterId,
      emailOption: req.body.email_option,
      organizationId: req.body.organizationId,
      userId: req.user.id,
    }

    if (req.body.organizerProfileImage) {
      var upload_organizer_profile_image =
        await uploadOrganizerProfileImage.uploadOrganizerProfileImage(req)
      organizer_data.organizerProfileImage = upload_organizer_profile_image
    }

    const save_organizer = await OrganizerService.create(organizer_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organizer Created Successfully',
      data: save_organizer,
    })
  } catch (err) {
    console.log('error', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.getOrganizer = async (req, res) => {
  try {
    let organizer = await OrganizerService.getOrganizer(
      req.user.id
    );

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    const organizer_paginator = await Pagination.paginator(
      organizer,
      page,
      limit
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: organizer_paginator,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('jhjifhd', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.getOrganizerListForEvent = async (req, res) => {
  try {
    let organizer;
    if(req.query.eventId !== ""){
      let event = await Event.findOne({ _id:req.query.eventId })
      organizer = await OrganizerService.getOrganizer(
        event.userId
      );
    }else{
      organizer = await OrganizerService.getOrganizer(
        req.user.id
      );
    }

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    const organizer_paginator = await Pagination.paginator(
      organizer,
      page,
      limit
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: organizer_paginator,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('jhjifhd', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}


exports.editOrganizer = async (req, res) => {
  try {
    let profile_image = await Organizer.findOne({ _id: req.params.organizerId })
    const edit_organizer = await OrganizerService.editOrganizer(
      req.params.organizerId,
      profile_image.organizerProfileImage
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_organizer[0],
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

exports.updateOrganizer = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      organizer_name: 'required',
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

    let organizer_data = {
      _id: req.body.organizerId,
      organizerName: req.body.organizer_name,
      website: req.body.website,
      organizerBio: req.body.organizer_bio,
      description: req.body.description,
      facebookId: req.body.facebookId,
      twitterId: req.body.twitterId,
      emailOption: req.body.email_option,
      organizationId: req.body.organizationId,
      userId: req.user.id,
    }

    if (req.body.organizerProfileImage) {
      var upload_organizer_profile_image =
        await uploadOrganizerProfileImage.uploadOrganizerProfileImage(req)
      organizer_data.organizerProfileImage = upload_organizer_profile_image
    }

    const update_organizer = await OrganizerService.update(organizer_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organizer Updated Successfully',
      data: update_organizer,
    })
  } catch (err) {
    console.log('error', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.deleteOrganizer = async (req, res) => {
  try {

    const event = await Event.find({organizerId:req.params.organizerId})
    if(event.length > 0){
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        message: "This orgaizer is associated with event",
        data: [],
      })
    }

    const delete_organizer = await OrganizerService.destory(
      req.params.organizerId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_organizer,
      message: 'Organizer deleted successfully',
    })
  } catch (err) {
    console.log('error', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.removeOrganizerLogo = async (req, res) => {
  try {
    let organizer = await Organizer.findOne({ _id: req.params.organizerId })
    const dirPath = path.join(__dirname, '../../')
    fs.unlinkSync(
      dirPath + 'public/organizer/' + organizer.organizerProfileImage
    )
    await Organizer.findByIdAndUpdate(organizer._id, {
      $set: { organizerProfileImage: '' },
    })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organizer profile image removed successfully',
    })
  } catch (error) {
    console.log('organizer profile image remove error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}
