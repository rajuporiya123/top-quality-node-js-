const Event = require('../models/Event')
const { Validator } = require('node-input-validator')
const EventService = require('../services/EventService')
const uploadEventDocument = require('../config/config')
const Pagination = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')
const cron = require('node-cron')
const moment = require('moment')
const mongoose = require('mongoose')
const UserStaff = require('../models/UserStaff')
const User = require('../models/User')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const hbs = require('nodemailer-express-handlebars')


const handlebarOptions = {
  viewEngine: {
    partialsDir: 'emails/',
    defaultLayout: false,
  },
  extName: '.hbs',
  viewPath: 'emails/',
}

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
)
transporter.use('compile', hbs(handlebarOptions))
//cron job for checking and setting status
cron.schedule('* * * * *', async function () {
  console.log('running a task every minute')
  let events = await Event.find()
  for (let i = 0; i < events.length; i++) {
    if (events[i].publishEvent == 'Publish Now') {
      if (events[i].toBeAnnouncedDate == false) {
        const endDay = events[i].endDate.getDate()
        const endMonth = events[i].endDate.getMonth() + 1
        const endYear = events[i].endDate.getFullYear()

        const finalEndDate = new Date(
          `${endMonth}/${endDay}/${endYear} ${events[i].endTime}`
        ).getTime()

        const finalNowDate = new Date().getTime()

        if (finalEndDate < finalNowDate) {
          events[i].status = 'Past'
        } else {
          if (events[i].isCommitteeMember) {
            // const member = await UserStaff.findOne({
            //   'eventData.eventId': events[i]._id,
            //   'eventData.isEventAccept': true,
            // })
            if (events[i].userStaffId.length > 0) {
              events[i].status = 'Live'
            } else {
              events[i].status = 'Draft'
            }
          } else {
            events[i].status = 'Live'
          }
        }
      } else {
        if (events[i].isCommitteeMember) {
          // const member = await UserStaff.findOne({
          //   'eventData.eventId': events[i]._id,
          //   'eventData.isEventAccept': true,
          // })
          if (events[i].userStaffId.length > 0) {
            events[i].status = 'Live'
          } else {
            events[i].status = 'Draft'
          }
        } else {
          events[i].status = 'Live'
        }
      }
    } else if (events[i].publishEvent == 'Schedule for later') {
      const startDay = events[i].publishStartDate.getDate()
      const startMonth = events[i].publishStartDate.getMonth() + 1
      const startYear = events[i].publishStartDate.getFullYear()

      const finalStartDate = new Date(
        `${startMonth}/${startDay}/${startYear} ${events[i].publishStartTime}`
      ).getTime()
      const finalNowDate = new Date().getTime()

      if (finalStartDate <= finalNowDate) {
        events[i].publishEvent = 'Publish Now'
        if (events[i].isCommitteeMember) {
          // const member = await UserStaff.findOne({
          //   'eventData.eventId': events[i]._id,
          //   'eventData.isEventAccept': true,
          // })
          if (events[i].userStaffId.length > 0) {
            events[i].status = 'Live'
          } else {
            events[i].status = 'Draft'
          }
        } else {
          events[i].status = 'Live'
        }
      } else {
        events[i].status = 'Draft'
      }
    } else {
      if (events[i].toBeAnnouncedDate == false) {
        const endDay = events[i].endDate.getDate()
        const endMonth = events[i].endDate.getMonth() + 1
        const endYear = events[i].endDate.getFullYear()

        const finalEndDate = new Date(
          `${endMonth}/${endDay}/${endYear} ${events[i].endTime}`
        ).getTime()

        const finalNowDate = new Date().getTime()

        if (finalEndDate < finalNowDate) {
          events[i].status = 'Past'
        } else {
          events[i].status = 'Draft'
        }
      }
    }
    events[i].save()
  }
})

exports.createEvent = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      title: 'required',
      tags: 'required',
      time_zone: 'required',
    })

    const matched = await validator.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: validator.errors,
      })
    }

    let check_slug = await Event.find({ slug: req.body.slug })

    if (check_slug.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please enter unique slug name.',
      })
    }

    if (req.body.event_frequency === 'Monthly' && req.body.event_month === '') {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please select event month',
      })
    } else if (
      req.body.event_frequency === 'Yearly' &&
      req.body.event_year === ''
    ) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please select event year',
      })
    } else if (
      req.body.event_frequency === 'Weekly' &&
      req.body.event_day === ''
    ) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please select event day',
      })
    } else {
      let data = {
        eventTitle: req.body.title,
        tags: req.body.tags,
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country:req.body.country,
        pincode: req.body.pincode,
        userId: req.user.id,
        organizerId: req.body.organizerId != '' ? req.body.organizerId : null,
        toBeAnnounced: req.body.toBeAnnounced,
        startDate:
          req.body.start_date == ''
            ? null
            : moment(req.body.start_date, 'MM/DD/YYYY').format('YYYY-MM-DD'),
        startTime: req.body.start_time,
        endDate:
          req.body.end_date == ''
            ? null
            : moment(req.body.end_date, 'MM/DD/YYYY').format('YYYY-MM-DD'),
        endTime: req.body.end_time,
        eventFrequency: req.body.event_frequency,
        eventDay: req.body.event_day,
        eventMonth: req.body.event_month,
        eventYear: req.body.event_year,
        displayStartTime: req.body.display_start_time,
        displayEndTime: req.body.display_end_time,
        timeZone: req.body.time_zone,
        status: req.body.status,
        eventType: req.body.event_type,
        category: req.body.category,
        subCategory: req.body.sub_category,
        toBeAnnouncedDate: req.body.toBeAnnouncedDate,
        currency: req.body.currency,
        isCommitteeMember: req.body.is_committee_member,
        slug: req.body.slug,
      }

      const event = await EventService.create(data)

      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Event Added Successfully',
        data: event,
      })
    }
  } catch (error) {
    console.log('err', error)
  }
}

exports.updateSlug = async (req, res) => {
  try {
    let check_slug = await Event.find({ slug: req.body.slug })
    if (check_slug.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Please enter unique slug name.',
      })
    }

    const update_slug = await Event.findOneAndUpdate(
      { _id: req.body._id },
      { slug: req.body.slug }
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Slug Updated Successfully',
      data: update_slug,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.getEventBySlug = async (req, res) => {
  try {
    let event = await Event.aggregate([
      {
        $project: {
          _id: 1,
          tags: 1,
          name: 1,
          lat: 1,
          lng: 1,
          address: 1,
          pincode: 1,
          city: 1,
          state: 1,
          country:1,
          eventTitle: 1,
          startDate: {
            $cond: {
              if: { $eq: ['$startDate', null] },
              then: '',
              else: '$startDate',
            },
          },
          startTime: 1,
          status: 1,
          userId: 1,
          organizerId: 1,
          toBeAnnounced: 1,
          endDate: {
            $cond: {
              if: { $eq: ['$endDate', null] },
              then: '',
              else: '$endDate',
            },
          },
          endTime: 1,
          eventFrequency: 1,
          eventDay: 1,
          eventMonth: 1,
          eventYear: 1,
          displayStartTime: 1,
          displayEndTime: 1,
          timeZone: 1,
          banner: { $concat: [process.env.EVENT_BANNER, '$banner'] },
          summary: 1,
          description: 1,
          displayRemainingTickets: 1,
          ticketEvent: 1,
          admissionLabel: 1,
          addonLabel: 1,
          messageAfterTicketSalesEnd: 1,
          publishEvent: 1,
          publishStartDate: {
            $cond: {
              if: { $eq: ['$publishStartDate', null] },
              then: '',
              else: '$publishStartDate',
            },
          },
          publishStartTime: 1,
          eventType: 1,
          category: 1,
          toBeAnnouncedDate: 1,
          currency: 1,
          isCommitteeMember: 1,
          slug: 1,
        },
      },
      {
        $match: {
          slug: req.params.slug,
        },
      },
    ])

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Data retrive successfully',
      data: event[0],
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.updateEvent = async (req, res) => {
  try {
    const event_update_data = {
      _id: req.body._id,
      eventTitle: req.body.title,
      tags: req.body.tags,
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country:req.body.country,
      pincode: req.body.pincode,
      toBeAnnounced: req.body.toBeAnnounced,
      startDate:
        req.body.start_date == ''
          ? null
          : req.body.start_date,
      startTime: req.body.start_time,
      endDate:
        req.body.end_date == ''
          ? null
          : req.body.end_date,
      endTime: req.body.end_time,
      eventFrequency: req.body.event_frequency,
      eventDay: req.body.event_day,
      eventMonth: req.body.event_month,
      eventYear: req.body.event_year,
      displayStartTime: req.body.display_start_time,
      displayEndTime: req.body.display_end_time,
      timeZone: req.body.time_zone,
      summary: req.body.summary,
      description: req.body.description,
      status: req.body.status,
      displayRemainingTickets: req.body.display_remaining_tickets,
      ticketEvent: req.body.ticket_event,
      admissionLabel: req.body.admission_label,
      addonLabel: req.body.addon_label,
      messageAfterTicketSalesEnd: req.body.message_after_ticket_salesEnd,
      publishEvent: req.body.publish_event,
      publishStartDate: req.body.publish_start_date,
      publishStartTime: req.body.publish_start_time,
      eventType: req.body.event_type,
      category: req.body.category,
      subCategory: req.body.sub_category,
      toBeAnnouncedDate: req.body.toBeAnnouncedDate,
      currency: req.body.currency,
      organizerId: req.body.organizerId != '' ? req.body.organizerId : null,
      isCommitteeMember: req.body.is_committee_member,
      // slug: req.body.slug,
    }

    if (req.body.publish_event == 'Publish Now') {
      const checkEvent = await Event.findById(req.body._id)
      const user = await User.findById(req.user.id)
      console.log(user,"sodjajdok")
      event_update_data.status = "Pending"
      const data = {
        from: 'contact@carnivalist.com',
        to: "carnivalistadmin@carnivalist.com",
        // to: "yash.nagar@cmarix.com",
        subject: 'Event Request',
        template: 'event-request',
        context: {
          managerName: `${user?.firstName} ${user?.lastName}`,
          eventName: `${checkEvent.eventTitle}`,
          link_url:`http://192.168.1.160:3000/events`,
          copyrightYear: new Date().getFullYear(),
        },
      }
      if (checkEvent.isCommitteeMember == true) {
        console.log(checkEvent, 'sbdjnad')
        if (checkEvent.userStaffId.length == 0) {
          return res.status(400).json({
            success: true,
            statusCode: statuscode.success,
            message:
              'Please add committee member or your event request is  not accepted',
            data: {},
          })
        }else
        {
          transporter.sendMail(data, (err, body) => {
            if (err) {
              console.log(err,"email error")
            }
            console.log(body,"email sended")
          })
        }
      }
      else
      {
        transporter.sendMail(data, (err, body) => {
          if (err) {
            console.log(err,"email error")
          }
          console.log(body,"email sended")
        })
      }
    }
    await EventService.updateEvent(event_update_data)
    let event = await Event.findById({ _id: req.body._id })
    let get_single_event = await EventService.getSingleEvent(
      req.body._id,
      event.banner
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Event Updated Successfully',
      data: get_single_event,
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.getAllEvent = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted == 'false' ? false : true

    let all_event = await EventService.getAllEvent(
      req.user.id,
      req.query.search,
      req.query.status,
      isDeleted
    )
    let event_paginator = await Pagination.paginator(
      all_event,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: event_paginator,
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.getEventDetails = async (req, res) => {
  try {
    let event = await Event.findById({ _id: req.params.id })
    let get_single_event = await EventService.getSingleEvent(
      req.params.id,
      event.banner
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_single_event[0],
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.addEventBanner = async (req, res) => {
  try {
    var upload_event_banner = await uploadEventDocument.uploadEventDocument(req)
    var add_banner = await EventService.addEventBanner(
      upload_event_banner,
      req.params.id
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: add_banner,
      message: 'Event Banner Added Successfully',
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

exports.cancelEvent = async (req, res) => {
  try {
    const cancelEvent = await EventService.cancelEvent(
      req.params.id,
      req.body.isCancelled
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: cancelEvent,
      message: 'Event Cancel Successfully',
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

exports.deleteEvent = async (req, res) => {
  try {
    const deleteEvent = await EventService.deleteEvent(req.params.id)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Event deleted successfully',
      data: deleteEvent,
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

exports.getDashboard = async (req, res) => {
  try {
    // var total_event = await Event.find({
    //   userId: req.user.id,
    //   isDeleted: false,
    // })
    const EventTickets = await EventService.ticketSoldCount(req.user.id)

    // const ticketArray = await EventService.ticketSoldCount(req.user.id)
    // console.log(ticketSoldArray,"sdijiasjd")
    // const EventTickets = await Event.aggregate([
    //   {
    //     $lookup: {
    //       from: 'tickets',
    //       localField: '_id',
    //       foreignField: 'eventId',
    //       as: 'ticketDetails',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'tickets',
    //       localField: '_id',
    //       foreignField: 'eventId',
    //       as: 'graphValue',
    //       pipeline:[
    //         {
    //           $lookup: {
    //             from: 'events',
    //             localField: 'eventId',
    //             foreignField: '_id',
    //             as: 'EventDetail',
    //           },
    //         },
    //         {
    //           $unwind: '$EventDetail',
    //         },
    //         {
    //           $lookup: {
    //             from: 'ticketsells',
    //             localField: '_id',
    //             foreignField: 'ticketId',
    //             as: "ticketSellDetails"
    //           },
    //         },
    //         {
    //           $addFields:{
    //             sellPrice:{
    //               $map: {
    //                 input: "$ticketSellDetails",
    //                 as: "value",
    //                 in:{$convert: { input: "$$value.price" , to: "int" }}
    //               }
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             isDeleted: '$EventDetail.isDeleted',
    //             eventId: '$EventDetail._id',
    //             userId: 1,
    //             ticketSellDetails:1,
    //             createdAt:1,
    //             ticketSold: {
    //               $cond: {
    //                 if: { $eq: ['$soldTicket', ''] },
    //                 then: { $toInt: '0' },
    //                 else: { $toInt: '$soldTicket' },
    //               },
    //             },
    //             sellPrice:{$sum:"$sellPrice"}
    //           },
    //         },
    //         {
    //           $match: {
    //             userId: mongoose.Types.ObjectId(req.user.id),
    //             isDeleted: false,
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: '$userId',
    //             ticketSold: { $push:{ticketSale:'$sellPrice',time:"$createdAt",eventId:"$eventId",ticketSellDetails:"$ticketSellDetails"}},
    //           },
    //         },
    //         {
    //           $project:{
    //             _id:1,
    //             "ticketSold.ticketSale":1,
    //             "ticketSold.time":1,
    //             "ticketSold.eventId":1,
    //             "ticketSold.ticketSellDetails.price":1,
    //             "ticketSold.ticketSellDetails._id":1,
    //             "ticketSold.ticketSellDetails.createdAt":1,
    //             "ticketSold.ticketSellDetails.ticketId":1,
    //           }
    //         }

    //       ]
    //     },
    //   },
    //   {
    //     $project:{
    //       _id:1,
    //       isDeleted:1,
    //       eventTitle:1,
    //       "ticketDetails.name":1,
    //       "ticketDetails._id":1,
    //       "ticketDetails.availableQuantity":1,
    //       "ticketDetails.soldTicket":1,
    //       "ticketDetails.price":1,
    //       "graphValue":{$arrayElemAt:["$graphValue.ticketSold",0]}
    //     },
    //   },
    // ])

    // for(let i=0;i<EventTickets.length;i++) {
    //   EventTickets[i].graphValue = ticketSoldArray[0].ticketSold.filter((item)=>{
    //     return item.eventId == EventTickets[i]._id.toString()
    //   })
    // }
    // const total_ticket_sold = ticket_sold_array[0].ticketSold.reduce(function (
    //   a,
    //   b
    // ) {
    //   return a + b
    // },
    // 0)
    // console.log(total_ticket_sold,"shuhausd")

    // const data ={
    //   ticketSoldArray,
    //   EventTickets
    // }

    // const total_sell = ticket_sold_array[0].totalSell.reduce(function (a, b) {
    //   return a + b
    // }, 0)
    // console.log(total_sell,"shuhausd")

    // var user_dashboard_count = {
    //   totalEvent: total_event.length,
    //   totalTicketSold: total_ticket_sold,
    //   totalSell: total_sell,
    // }
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: EventTickets,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('sjdfghsdg', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
exports.getEventGraph = async (req, res) => {
  try {
    const validator = new Validator(req.query, {
      eventId: 'required',
    })

    const matched = await validator.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: validator.errors,
      })
    }

    if (req.query.eventId) {
      const EventTickets = await EventService.eventGraph(
        req.query.eventId,
        req.user.id,
        req.query.ticketId,
        req.query.filter
      )
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        data: EventTickets[0],
        message: 'Data retrived successfully',
      })
    }
  } catch (err) {
    console.log('sjdfghsdg', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
exports.getAllEventForStaffAndCommitteeMember = async (req, res) => {
  try {
    var member_event = await Event.find({
      userId: req.user.id,
      isDeleted: false,
    })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: member_event,
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

exports.getEventDashboard = async (req, res) => {
  try {
    const event_dashboard_data = await EventService.getEventDashboard(
      req.params.eventId
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: event_dashboard_data,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err.message,
      data: [],
    })
  }
}

exports.getPublishEvent = async (req, res) => {
  try {
    const ticket_details = await EventService.getPublishEvent(
      req.params.eventId
    )

    const event_details = await Event.aggregate([
      {
        $project: {
          eventTitle: 1,
          endDate: 1,
          endTime: 1,
          startDate: 1,
          startTime: 1,
          address: 1,
          summary: 1,
          banner: { $concat: [process.env.EVENT_BANNER, '$banner'] },
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.eventId),
        },
      },
    ])
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: { event_details, ticket_details },
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
