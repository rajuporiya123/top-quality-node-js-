const Ticket = require('../models/Ticket')
const Event = require('../models/Event')
const TicketService = require('../services/TicketService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const cron = require('node-cron')
const { default: mongoose } = require('mongoose')
const { statuscode } = require('../config/codeAndMessage')

cron.schedule('* * * * *', async function () {
  console.log('running a task every minute')

  let events = await Event.find()

  for (let i = 0; i < events.length; i++) {
    let tickets = await Ticket.find({
      eventId: mongoose.Types.ObjectId(events[i]?._id),
    })
    for (let j = 0; j < tickets.length; j++) {
      if (tickets[j].availableTickets == 'whensalesendfor') {
        const names = tickets.filter((t) => t.name == tickets[j].ticketOption)
        // console.log('<<<>>>>>', names)
        const endDay = names[0].salesEnd.getDate()
        const endMonth = names[0].salesEnd.getMonth() + 1
        const endYear = names[0].salesEnd.getFullYear()

        // console.log('Date: ', endDay, endMonth, endYear, names[0].endTime)

        const finalEndDate = new Date(
          `${endMonth}/${endDay}/${endYear} ${names[0].endTime}`
        ).getTime()

        const finalNowDate = new Date().getTime()

        if (finalNowDate >= finalEndDate) {
          let nowDate1 = new Date()
          let nowHours1 = nowDate1.getHours()
          const nowMin1 = nowDate1.getMinutes()
          let pmam1
          if (nowHours1 > 12) {
            pmam1 = 'PM'
          } else {
            pmam1 = 'AM'
          }
          nowHours1 = pmam1 == 'PM' ? nowHours1 - 12 : nowHours1
          const setTime = `${nowHours1}:${nowMin1} ${pmam1}`

          // tickets[j].ticketSaleType = 'On Sale'
          tickets[j].salesStart = Date.now()
          tickets[j].startTime = setTime
          tickets[j].ticketOption = ''
          tickets[j].availableTickets = 'Dateandtime'

          tickets[j].save()
        }
      }

      if (tickets[j].availableTickets == 'Dateandtime') {
        // console.log(tickets[j])
        const startDay = tickets[j].salesStart.getDate()
        const startMonth = tickets[j].salesStart.getMonth() + 1
        const startYear = tickets[j].salesStart.getFullYear()
        const finalStartDate = new Date(
          `${startMonth}/${startDay}/${startYear} ${tickets[j].startTime}`
        ).getTime()

        const endDay = tickets[j].salesEnd.getDate()
        const endMonth = tickets[j].salesEnd.getMonth() + 1
        const endYear = tickets[j].salesEnd.getFullYear()
        const finalEndDate = new Date(
          `${endMonth}/${endDay}/${endYear} ${tickets[j].endTime}`
        ).getTime()
        const finalNowDate = new Date().getTime()

        if (finalStartDate <= finalNowDate && finalEndDate > finalNowDate) {
          if (events[i].status == 'Live') {
            tickets[j].ticketSaleType = 'On Sale'
          } else {
            tickets[j].ticketSaleType = 'Scheduled'
          }
        } else if (finalNowDate >= finalEndDate) {
          tickets[j].ticketSaleType = 'Ended'
        } else if (finalNowDate < finalStartDate) {
          tickets[j].ticketSaleType = 'Scheduled'
        }

        tickets[j].save()
      } else {
        const endDay = tickets[j].salesEnd.getDate()
        const endMonth = tickets[j].salesEnd.getMonth() + 1
        const endYear = tickets[j].salesEnd.getFullYear()
        const finalEndDate = new Date(
          `${endMonth}/${endDay}/${endYear} ${tickets[j].endTime}`
        ).getTime()
        const finalNowDate = new Date().getTime()

        if (finalNowDate >= finalEndDate) {
          tickets[j].ticketSaleType = 'Ended'
        } else {
          tickets[j].ticketSaleType = 'Scheduled'
        }

        tickets[j].save()
      }
    }
  }
})

exports.createTicket = async (req, res) => {
  try {
    if (req.body.ticket_type == 'Paid') {
      const validator = new Validator(req.body, {
        name: 'required',
        available_quantity: 'required',
        price: 'required',
        available_tickets: 'required',
        sales_start: 'required',
        sales_end: 'required',
        minimum_quantity: 'required',
        maximum_quantity: 'required',
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
    }

    let ticket = await TicketService.checkTicket(
      req.body.name,
      req.body.eventId
    )
    if (ticket.length > 0) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: 'Ticket name already registered',
      })
    }

    let ticket_data = {
      name: req.body.name,
      availableQuantity: req.body.available_quantity,
      price: req.body.price,
      availableTickets: req.body.available_tickets,
      salesStart: req.body.sales_start,
      salesEnd: req.body.sales_end,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      description: req.body.description,
      visibility: req.body.visibility,
      minimumQuantity: req.body.minimum_quantity,
      maximumQuantity: req.body.maximum_quantity,
      salesChannel: req.body.sales_channel,
      eTicket: req.body.eTicket,
      willCall: req.body.will_call,
      wristBand: req.body.wrist_band,
      ticketType: req.body.ticket_type,
      eventId: req.body.eventId,
      userId: req.user.id,
      ticketOption: req.body.ticket_option,
      ticketSaleType: 'On Sale',
      showTicketSaleEndDatesAndSaleStatusAtCheckout:
        req.body.show_ticketsaleenddates_and_salestatus_atcheckout,
      startShowingOn: req.body.start_showingon,
      startShowingTime: req.body.start_showing_time,
      stopShowingOn: req.body.stop_showingon,
      endShowingTime: req.body.end_showing_time,
    }

    const event = await Event.findOne({
      _id: mongoose.Types.ObjectId(ticket_data.eventId),
    })

    if (ticket_data.availableTickets == 'Dateandtime') {
      const finalStartDate = new Date(
        `${ticket_data.salesStart} ${ticket_data.startTime}`
      )

      const finalEndDate = new Date(
        `${ticket_data.salesEnd} ${ticket_data.endTime}`
      )

      const finalNowDate = new Date()

      if (finalNowDate.getTime() < finalStartDate.getTime()) {
        ticket_data.ticketSaleType = 'Scheduled'
      } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
        ticket_data.ticketSaleType = 'Ended'
      } else if (
        finalStartDate.getTime() <= finalNowDate.getTime() &&
        finalEndDate.getTime() > finalNowDate.getTime()
      ) {
        if (event?.status == 'Live') {
          ticket_data.ticketSaleType = 'On Sale'
        } else {
          ticket_data.ticketSaleType = 'Scheduled'
        }
      }
    } else {
      ticket_data.ticketSaleType = 'Scheduled'
    }

    let create_ticket = await TicketService.create(ticket_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_ticket,
      message: 'Ticket Created Successfully',
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

exports.getAllTicket = async (req, res) => {
  try {
    const get_ticket = await TicketService.getTicket(req.query.eventId)
    let ticket_paginator = await Pagination.paginator(
      get_ticket,
      req.query.page,
      req.query.limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: ticket_paginator,
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

exports.editTicket = async (req, res) => {
  try {
    const get_ticket = await TicketService.editTicket(req.params.ticketId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_ticket[0],
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

exports.deleteTicket = async (req, res) => {
  try {
    const deletedTicket = await Ticket.aggregate([
      {
        $project: {
          eventId: 1,
          name: 1,
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.ticketId),
        },
      },
    ])

    //get detailes of which tickets to set onsale for tickets
    const ticketDetailes = await Ticket.aggregate([
      {
        $project: {
          availableTickets: 1,
          ticketOption: 1,
          eventId: 1,
        },
      },
      {
        $match: {
          eventId: deletedTicket[0]?.eventId,
        },
      },
    ])

    const filteredTickets = ticketDetailes.filter(
      (t) => t.availableTickets == 'whensalesendfor'
    )

    let advanceFilterTickets = filteredTickets.filter(
      (t) => t.ticketOption == deletedTicket[0]?.name
    )

    advanceFilterTickets.map(async (t) => {
      let nowDate = new Date()
      let nowHours = nowDate.getHours()
      const nowMin = nowDate.getMinutes()
      let pmam
      if (nowHours > 12) {
        pmam = 'PM'
      } else {
        pmam = 'AM'
      }
      nowHours = pmam == 'PM' ? nowHours - 12 : nowHours
      const setTime = `${nowHours}:${nowMin} ${pmam}`
      const update_ticket = await Ticket.updateOne(
        { _id: mongoose.Types.ObjectId(t._id) },
        {
          $set: {
            ticketSaleType: 'On Sale',
            salesStart: Date.now(),
            startTime: setTime,
            ticketOption: '',
            availableTickets: 'Dateandtime',
          },
        }
      )
    })

    const delete_ticket = await TicketService.destory(req.params.ticketId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_ticket,
      message: 'Ticket Deleted Successfully',
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

exports.updateTicket = async (req, res) => {
  try {
    if (req.body.ticket_type == 'Paid') {
      const validator = new Validator(req.body, {
        name: 'required',
        available_quantity: 'required',
        price: 'required',
        available_tickets: 'required',
        sales_start: 'required',
        sales_end: 'required',
        minimum_quantity: 'required',
        maximum_quantity: 'required',
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
    }

    let ticket_data = {
      _id: req.body._id,
      name: req.body.name,
      availableQuantity: req.body.available_quantity,
      price: req.body.price,
      availableTickets: req.body.available_tickets,
      salesStart: req.body.sales_start,
      salesEnd: req.body.sales_end,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      description: req.body.description,
      visibility: req.body.visibility,
      minimumQuantity: req.body.minimum_quantity,
      maximumQuantity: req.body.maximum_quantity,
      salesChannel: req.body.sales_channel,
      eTicket: req.body.eTicket,
      willCall: req.body.will_call,
      wristBand: req.body.wrist_band,
      ticketType: req.body.ticket_type,
      eventId: req.body.eventId,
      userId: req.user.id,
      ticketOption: req.body.ticket_option,
      ticketSaleType: 'On Sale',
      showTicketSaleEndDatesAndSaleStatusAtCheckout:
        req.body.show_ticketsaleenddates_and_salestatus_atcheckout,
      startShowingOn: req.body.start_showingon,
      startShowingTime: req.body.start_showing_time,
      stopShowingOn: req.body.stop_showingon,
      endShowingTime: req.body.end_showing_time,
    }

    const event = await Event.findOne({
      _id: mongoose.Types.ObjectId(ticket_data.eventId),
    })

    if (ticket_data.availableTickets == 'Dateandtime') {
      const finalStartDate = new Date(
        `${ticket_data.salesStart} ${ticket_data.startTime}`
      )

      const finalEndDate = new Date(
        `${ticket_data.salesEnd} ${ticket_data.endTime}`
      )

      const finalNowDate = new Date()

      if (finalNowDate.getTime() < finalStartDate.getTime()) {
        ticket_data.ticketSaleType = 'Scheduled'
      } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
        ticket_data.ticketSaleType = 'Ended'
      } else if (
        finalStartDate.getTime() <= finalNowDate.getTime() &&
        finalEndDate.getTime() > finalNowDate.getTime()
      ) {
        if (event?.status == 'Live') {
          ticket_data.ticketSaleType = 'On Sale'
        } else {
          ticket_data.ticketSaleType = 'Scheduled'
        }
      }
    } else {
      ticket_data.ticketSaleType = 'Scheduled'
    }

    let update_ticket = await TicketService.update(ticket_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_ticket,
      message: 'Ticket Updated Successfully',
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

exports.getTicketOption = async (req, res) => {
  try {
    const ticket_option = await TicketService.getTicketOption(
      req.params.eventId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: ticket_option,
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
