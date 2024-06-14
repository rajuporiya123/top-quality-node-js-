const EmailTemplate = require('../models/EmailTemplate')
const mongoose = require('mongoose')

module.exports = class EmailTemplateService {
  static async create(data) {
    try {
      const create_email_template = await EmailTemplate.create(data)
      return create_email_template
    } catch (error) {
      console.log(`Could not add email template ${error}`)
      throw error
    }
  }

  static async getEmailTemplate(userId) {
    try {
      const get_email_template = await EmailTemplate.aggregate([
        {
          $project: {
            templateName: 1,
            userId: 1,
            createdByAdmin: 1,
            html: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      return get_email_template
    } catch (error) {
      console.log(`Could not get email template ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let email_template_delete_data = await EmailTemplate.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return email_template_delete_data
    } catch (error) {
      console.log('Error in deleting email template', error)
      throw error
    }
  }

  static async editEmailTemplate(templateId) {
    try {
      const edit_email_template = await EmailTemplate.aggregate([
        {
          $project: {
            _id: 1,
            templateName: 1,
            userId: 1,
            html: 1,
            mailTemplateDesign: 1,
            createdByAdmin: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(templateId),
          },
        },
      ])
      return edit_email_template
    } catch (error) {
      console.log(`Could not edit email template ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_email_template = await EmailTemplate.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_email_template
    } catch (error) {
      console.log(`Could not update email template ${error}`)
      throw error
    }
  }
}
