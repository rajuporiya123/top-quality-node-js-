const EmailTemplate = require('../models/EmailTemplate')
const EmailTemplateService = require('../services/EmailTemplateService')
const { Validator } = require('node-input-validator')
const { statuscode } = require('../config/codeAndMessage')

exports.createEmailTemplate = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      template_name: 'required',
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

    let email_template_data = {
      templateName: req.body.template_name,
      html: req.body.html,
      createdByAdmin: req.body.created_by_admin,
      userId: req.user.id,
      mailTemplateDesign: req.body.mail_template_design,
    }

    let create_email_template = await EmailTemplateService.create(
      email_template_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_email_template,
      message: 'Email Template Created Successfully',
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

exports.getAllEmailTemplate = async (req, res) => {
  try {
    const get_email_template = await EmailTemplateService.getEmailTemplate(
      req.user.id
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_email_template,
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

exports.editEmailTemplate = async (req, res) => {
  try {
    const edit_email_template = await EmailTemplateService.editEmailTemplate(
      req.params.templateId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_email_template[0],
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

exports.updateEmailTemplate = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      template_name: 'required',
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

    let email_template_data = {
      _id: req.body.templateId,
      templateName: req.body.template_name,
      html: req.body.html,
      createdByAdmin: req.body.created_by_admin,
      userId: req.user.id,
      mailTemplateDesign: req.body.mail_template_design,
    }

    let update_email_template = await EmailTemplateService.update(
      email_template_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_email_template,
      message: 'Email Template Updated Successfully',
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

exports.deleteEmailTemplate = async (req, res) => {
  try {
    const delete_email_template = await EmailTemplateService.destroy(
      req.params.templateId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_email_template,
      message: 'Email template deleted successfully',
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

exports.getEmailTemplate = async (req, res) => {
  try {
    const get_email_template = await EmailTemplate.find({ userId: req.user.id })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_email_template,
      message: 'Data retrived successfully',
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
