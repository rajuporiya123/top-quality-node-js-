const EmailCampaign = require('../models/EmailCampaign')
const mongoose = require('mongoose')

module.exports = class EmailCampaignService {
  static async create(data) {
    try {
      const create_email_campaign = await EmailCampaign.create(data)
      return create_email_campaign
    } catch (error) {
      console.log(`Could not add email campaign ${error}`)
      throw error
    }
  }

  static async getEmailCampaign(userId, globalSearch) {
    try {
      const regex = new RegExp(globalSearch, 'i')

      let matchObj
      if (globalSearch) {
        matchObj = {
          userId: mongoose.Types.ObjectId(userId),
          subject: regex,
        }
      } else {
        matchObj = {
          userId: mongoose.Types.ObjectId(userId),
        }
      }

      const get_email_campaign = await EmailCampaign.aggregate([
        {
          $project: {
            subject: 1,
            toMail: 1,
            status: 1,
            createdTimestamp: 1,
            campaignType: 1,
            userId: 1,
            updatedAt: 1,
            createdAt: 1,
            recipients: 1,
          },
        },
        {
          $match: matchObj,
        },
        { $sort: { createdAt: -1 } },
      ])
      return get_email_campaign
    } catch (error) {
      console.log(`Could not get marketing email ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let email_campaign_delete_data = await EmailCampaign.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return email_campaign_delete_data
    } catch (error) {
      console.log('Error in deleting email campaign', error)
      throw error
    }
  }

  static async editEmailCampaign(emailCampaignId) {
    try {
      const edit_email_campaign = await EmailCampaign.aggregate([
        {
          $lookup: {
            from: 'marketinggroups',
            localField: 'marketingGroupId',
            foreignField: '_id',
            as: 'marketinggroupObject',
          },
        },
        {
          $project: {
            _id: 1,
            subject: 1,
            marketingGroupDetails: '$marketinggroupObject',
            fromName: 1,
            fromEmail: 1,
            // marketingGroupId: 1,
            emailTemplateId: 1,
            mailTemplateDesign: 1,
            html: 1,
            recipients: 1,
            toMail: 1,
            eventId: 1,
            status: 1,
            campaignType: 1,
            createdTimeStamp: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(emailCampaignId),
          },
        },
      ])
      return edit_email_campaign
    } catch (error) {
      console.log(`Could not edit email campaign ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_email_campaign = await EmailCampaign.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_email_campaign
    } catch (error) {
      console.log(`Could not update email campaign ${error}`)
      throw error
    }
  }
}
