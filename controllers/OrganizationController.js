const Organization = require('../models/Organization')
const Organizer = require('../models/Organizer')
const Event = require('../models/Event')
const OrganizationService = require('../services/OrganizationService')
const { Validator } = require('node-input-validator')
const uploadOrganizationLogo = require('../config/config')
const path = require('path')
const fs = require('fs')
const { statuscode } = require('../config/codeAndMessage')
const { default: mongoose } = require('mongoose')

exports.createOrganization = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      organization_name: 'required',
      preffered_country: 'required',
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

    let organization_data = {
      organizationName: req.body.organization_name,
      prefferedCountry: req.body.preffered_country,
      userId: req.user.id,
    }

    if (req.body.organizationLogo) {
      var upload_organization_logo =
        await uploadOrganizationLogo.uploadOrganizationLogo(req)
      organization_data.organizationLogo = upload_organization_logo
    }

    const save_organization = await OrganizationService.create(
      organization_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organization Created Successfully',
      data: save_organization,
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

exports.getOrganization = async (req, res) => {
  try {
    let logo = await Organization.findOne({ userId: req.user.id })
    if (logo == null) {
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: [],
        message: 'Data retrived successfully',
      })
    } else {
      let organization = await OrganizationService.getOrganization(
        req.user.id,
        logo.organizationLogo
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: organization,
        message: 'Data retrived successfully',
      })
    }
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

exports.editOrganization = async (req, res) => {
  try {
    const get_organization = await OrganizationService.editOrganization(
      req.params.organizationId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_organization[0],
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

exports.updateOrganization = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      organization_name: 'required',
      preffered_country: 'required',
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

    let organization_data = {
      _id: req.body.organizationId,
      organizationName: req.body.organization_name,
      prefferedCountry: req.body.preffered_country,
      userId: req.user.id,
    }

    if (req.body.organizationLogo) {
      var upload_organization_logo =
        await uploadOrganizationLogo.uploadOrganizationLogo(req)
      organization_data.organizationLogo = upload_organization_logo
    }

    const save_organization = await OrganizationService.update(
      organization_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organization Updated Successfully',
      data: save_organization,
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

exports.deleteOrganization = async (req, res) => {
  try {
    const get_organizers = await Organizer.find({
      organizationId: req.params.organizationId,
    })

    for (let i = 0; i < get_organizers.length; i++) {
      const event = await Event.find({ organizerId: get_organizers[i]._id })
      if (event.length > 0) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: "This Organization's organizer is associated with event",
          data: [],
        })
      }
    }

    const delete_organization = await OrganizationService.destory(
      req.params.organizationId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_organization,
      message: 'Organization deleted successfully',
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

exports.removeOrganizationLogo = async (req, res) => {
  try {
    let organization = await Organization.findOne({ userId: req.user.id })
    const dirPath = path.join(__dirname, '../../')
    fs.unlinkSync(
      dirPath + 'public/organization/' + organization.organizationLogo
    )
    await Organization.findByIdAndUpdate(organization._id, {
      $set: { organizationLogo: '' },
    })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Organization logo removed successfully',
    })
  } catch (error) {
    console.log('organization logo remove error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
