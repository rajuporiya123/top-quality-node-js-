const EmailCampaignService = require('../services/EmailCampaignService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const nodemailer = require('nodemailer')
const { statuscode } = require('../config/codeAndMessage')
const Subscriber = require('../models/Subscriber')
const mongoose = require('mongoose')
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
)

exports.createEmailCampaign = async (req, res) => {
  try {
    if (req.body.campaign_type == 'Email Campaign') {
      if (req.body.status == 'Draft') {
        let email_campaign_data = {
          subject: req.body.subject,
          fromName: req.body.from_name,
          fromEmail: req.body.from_email,
          marketingGroupId:
            req.body.marketingGroupId != '' ? req.body.marketingGroupId : [],
          emailTemplateId:
            req.body.emailTemplateId != '' ? req.body.emailTemplateId : null,
          toMail: req.body.to_mail,
          eventId: req.body.eventId != '' ? req.body.eventId : null,
          status: req.body.status,
          campaignType: req.body.campaign_type,
          html: req.body.html,
          mailTemplateDesign: req.body.mail_template_design,
          recipients: JSON.parse(JSON.stringify(req.body.to_mail)),
          userId: req.user.id,
        }

        for (let i = 0; i < email_campaign_data.marketingGroupId.length; i++) {
          let subscriber_emails = await Subscriber.aggregate([
            {
              $project: {
                email: 1,
                marketingGroupId: 1,
              },
            },
            {
              $match: {
                marketingGroupId: mongoose.Types.ObjectId(
                  email_campaign_data.marketingGroupId[i]
                ),
              },
            },
          ])
          subscriber_emails?.map((s) => {
            email_campaign_data.recipients.push(s?.email)
            // const email_campaign = {
            //   from: email_campaign_data.fromEmail,
            //   to: s?.email,
            //   subject: req.body.subject,
            //   html: req.body.html,
            // }
            // transporter.sendMail(email_campaign)
          })
        }

        let create_email_campaign = await EmailCampaignService.create(
          email_campaign_data
        )
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          data: create_email_campaign,
          message: 'Email Campaign Draft Successfully',
        })
      } else {
        let email_campaign_data = {
          subject: req.body.subject,
          fromName: req.body.from_name,
          fromEmail: req.body.from_email,
          marketingGroupId: req.body.marketingGroupId,
          emailTemplateId: req.body.emailTemplateId,
          eventId: req.body.eventId,
          toMail: req.body.to_mail,
          status: req.body.status,
          campaignType: req.body.campaign_type,
          html: req.body.html,
          mailTemplateDesign: req.body.mail_template_design,
          userId: req.user.id,
          recipients: JSON.parse(JSON.stringify(req.body.to_mail)),
        }

        for (let i = 0; i < email_campaign_data.marketingGroupId.length; i++) {
          let subscriber_emails = await Subscriber.aggregate([
            {
              $project: {
                email: 1,
                marketingGroupId: 1,
              },
            },
            {
              $match: {
                marketingGroupId: mongoose.Types.ObjectId(
                  email_campaign_data.marketingGroupId[i]
                ),
              },
            },
          ])
          subscriber_emails?.map((s) => {
            email_campaign_data.recipients.push(s?.email)
            // const email_campaign = {
            //   from: email_campaign_data.fromEmail,
            //   to: s?.email,
            //   subject: req.body.subject,
            //   html: req.body.html,
            // }
            // transporter.sendMail(email_campaign)
          })
        }

        let create_email_campaign = await EmailCampaignService.create(
          email_campaign_data
        )

        if (email_campaign_data.toMail.length > 0) {
          const email_campaign = {
            from: email_campaign_data.fromEmail,
            to: email_campaign_data.recipients,
            subject: req.body.subject,
            html: req.body.html,
          }
          transporter.sendMail(email_campaign)
        }

        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          data: create_email_campaign,
          message: 'Email Campaign Created Successfully',
        })
      }
    } else {
      let email_campaign_data = {
        subject: req.body.subject,
        fromName: req.body.from_name,
        fromEmail: req.body.from_email,
        message: req.body.message,
        marketingGroupId: req.body.marketingGroupId,
        emailTemplateId:
          req.body.emailTemplateId != '' ? req.body.emailTemplateId : null,
        eventId: req.body.eventId,
        toMail: req.body.to_mail,
        status: req.body.status,
        campaignType: req.body.campaign_type,
        html: req.body.html,
        mailTemplateDesign: req.body.mail_template_design,
        recipients: [],
        userId: req.user.id,
      }

      let subscribers = await Subscriber.aggregate([
        {
          $project: {
            mobileNumber: 1,
            countryCode: 1,
            marketingGroupId: 1,
          },
        },
        {
          $match: {
            marketingGroupId: mongoose.Types.ObjectId(
              email_campaign_data.marketingGroupId[0]
            ),
          },
        },
      ])

      for (let i = 0; i <= subscribers.length - 1; i++) {
        let send_text_message = await client.messages.create({
          from: '+16303608149', //"+14695572198",
          to: `${subscribers[i]?.countryCode}${subscribers[i]?.mobileNumber}`,
          body: email_campaign_data.message,
        })
        console.log(email_campaign_data.recipients, '<<<<<<<<<hello>>>>>>>>>')
        email_campaign_data.recipients.push(
          `${subscribers[i]?.countryCode}${subscribers[i]?.mobileNumber}`
        )
      }

      let create_email_campaign = await EmailCampaignService.create(
        email_campaign_data
      )

      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: create_email_campaign,
        message: 'Text Message Campaign Successfully',
      })
    }
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

exports.getAllEmailCampaign = async (req, res) => {
  try {
    let get_email_campaign = await EmailCampaignService.getEmailCampaign(
      req.user.id
    )
    let email_campaign_paginator = await Pagination.paginator(
      get_email_campaign,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: email_campaign_paginator,
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

exports.editEmailCampaign = async (req, res) => {
  try {
    const edit_marketing_group = await EmailCampaignService.editEmailCampaign(
      req.params.emailCampaignId
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

exports.updateEmailCampaign = async (req, res) => {
  try {
    if (req.body.status == 'Draft') {
      let email_campaign_data = {
        _id: req.body.emailCampaignId,
        subject: req.body.subject,
        fromName: req.body.from_name,
        fromEmail: req.body.from_email,
        marketingGroupId:
          req.body.marketingGroupId != '' ? req.body.marketingGroupId : [],
        emailTemplateId:
          req.body.emailTemplateId != '' ? req.body.emailTemplateId : null,
        toMail: req.body.to_mail,
        eventId: req.body.eventId != '' ? req.body.eventId : null,
        status: req.body.status,
        campaignType: req.body.campaign_type,
        html: req.body.html,
        mailTemplateDesign: req.body.mail_template_design,
        recipients: JSON.parse(JSON.stringify(req.body.to_mail)),
        userId: req.user.id,
      }

      for (let i = 0; i < email_campaign_data.marketingGroupId.length; i++) {
        let subscriber_emails = await Subscriber.aggregate([
          {
            $project: {
              email: 1,
              marketingGroupId: 1,
            },
          },
          {
            $match: {
              marketingGroupId: mongoose.Types.ObjectId(
                email_campaign_data.marketingGroupId[i]
              ),
            },
          },
        ])
        subscriber_emails?.map((s) => {
          email_campaign_data.recipients.push(s?.email)
          // const email_campaign = {
          //   from: email_campaign_data.fromEmail,
          //   to: s?.email,
          //   subject: req.body.subject,
          //   html: req.body.html,
          // }
          // transporter.sendMail(email_campaign)
        })
      }

      let update_email_campaign = await EmailCampaignService.update(
        email_campaign_data
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: update_email_campaign,
        message: 'Email Campaign Draft Updated Successfully',
      })
    } else {
      let email_campaign_data = {
        _id: req.body.emailCampaignId,
        subject: req.body.subject,
        fromName: req.body.from_name,
        fromEmail: req.body.from_email,
        marketingGroupId: req.body.marketingGroupId,
        emailTemplateId: req.body.emailTemplateId,
        eventId: req.body.eventId,
        toMail: req.body.to_mail,
        status: req.body.status,
        campaignType: req.body.campaign_type,
        html: req.body.html,
        mailTemplateDesign: req.body.mail_template_design,
        recipients: JSON.parse(JSON.stringify(req.body.to_mail)),
        userId: req.user.id,
      }

      for (let i = 0; i < email_campaign_data.marketingGroupId.length; i++) {
        let subscriber_emails = await Subscriber.aggregate([
          {
            $project: {
              email: 1,
              marketingGroupId: 1,
            },
          },
          {
            $match: {
              marketingGroupId: mongoose.Types.ObjectId(
                email_campaign_data.marketingGroupId[i]
              ),
            },
          },
        ])
        subscriber_emails?.map((s) => {
          email_campaign_data.recipients.push(s?.email)
          // const email_campaign = {
          //   from: req.body.from_email,
          //   to: s?.email,
          //   subject: req.body.subject,
          //   html: req.body.html,
          // }
          // transporter.sendMail(email_campaign)
        })
      }

      if (email_campaign_data.toMail.length > 0) {
        const email_campaign = {
          from: email_campaign_data.fromEmail,
          to: email_campaign_data.recipients,
          subject: req.body.subject,
          html: req.body.html,
        }
        transporter.sendMail(email_campaign)
      }

      let update_email_campaign = await EmailCampaignService.update(
        email_campaign_data
      )

      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: update_email_campaign,
        message: 'Email Campaign Updated Successfully',
      })
    }
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

exports.deleteEmailCampaign = async (req, res) => {
  try {
    const delete_email_campaign = await EmailCampaignService.destroy(
      req.params.emailCampaignId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_email_campaign,
      message: 'Email Campaign deleted successfully',
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
