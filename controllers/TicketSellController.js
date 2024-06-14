const Ticket = require('../models/Ticket')
const mongoose = require('mongoose')
const TicketSellService = require('../services/TicketSellService')
const InvoiceService = require('../services/InvoiceService')
const { Validator } = require('node-input-validator')
const Pagination = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')

exports.createTicketSell = async (req, res) => {
  try {
    if (req.body.payment_type == 'Paid') {
      const validator = new Validator(req.body, {
        buyer_name: 'required',
        email: 'required',
        price: 'required',
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
    } else {
      //if not paid so we set price to free
      req.body.price = 'Free'
      const validator = new Validator(req.body, {
        buyer_name: 'required',
        email: 'required',
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

    let ticket_sell_data = {
      paymentType: req.body.payment_type,
      buyerName: req.body.buyer_name,
      email: req.body.email,
      price: req.body.price,
      cash: req.body.cash,
      atTheDoorstep: req.body.at_the_doorstep,
      ticketId: req.body.ticketId,
      eventId: req.body.eventId,
      userId: req.user.id,
      ticketNumber: Date.now(),
    }

    if (req.body.payment_type == 'Paid') {
      if (
        ticket_sell_data.atTheDoorstep === false &&
        ticket_sell_data.cash === false
      ) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          data: [],
          message: 'Please select atleast one payment type',
        })
      }
    }

    const ticketdetails = await Ticket.aggregate([
      {
        $project: {
          availableQuantity: 1,
          soldTicket: 1,
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(ticket_sell_data.ticketId),
        },
      },
    ])

    //get ticket sold count and total qty and update
    const availableQuantity = parseInt(ticketdetails[0].availableQuantity)
    let soldTicket = ticketdetails[0].soldTicket

    if (soldTicket == availableQuantity) {
      return res.status(200).json({
        success: false,
        statusCode: statuscode.success,
        data: [],
        message: 'You reached Your Ticket available quantity.',
      })
    } else if (soldTicket < availableQuantity) {
      soldTicket = soldTicket + 1
    } else {
      return res.status(200).json({
        success: false,
        statusCode: statuscode.success,
        data: [],
        message: 'Sold ticket cannot be greater than available quantity',
      })
    }

    const updateTicket = await Ticket.updateOne(
      { _id: mongoose.Types.ObjectId(ticketdetails[0]?._id) },
      { soldTicket: soldTicket }
    )

    const create_ticket_sell = await TicketSellService.create(ticket_sell_data)

    const invoice_data = {
      buyerName: ticket_sell_data.buyerName,
      userId: req.user.id,
      eventId: ticket_sell_data.eventId,
      ticketId: ticket_sell_data.ticketId,
      ticketSellId: create_ticket_sell?._id,
      invoiceNumber: Date.now(),
      price: ticket_sell_data.price,
      invoiceDate: Date.now(),
    }

    const create_invoice = await InvoiceService.create(invoice_data)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: create_ticket_sell,
      message: 'Ticket Sell Created Successfully',
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

exports.getTicketSellListing = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : ''

    const get_ticket_sell = await TicketSellService.getTicketSellListing(
      req.query.eventId,
      search
    )

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    let ticket_paginator = await Pagination.paginator(
      get_ticket_sell,
      page,
      limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: ticket_paginator,
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

exports.editTicketSell = async (req, res) => {
  try {
    const get_ticket_sell = await TicketSellService.editTicketSell(
      req.params.ticketSellId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_ticket_sell[0],
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

exports.updateTicketSell = async (req, res) => {
  try {
    if (req.body.payment_type == 'Paid') {
      const validator = new Validator(req.body, {
        buyer_name: 'required',
        email: 'required',
        price: 'required',
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
    } else {
      const validator = new Validator(req.body, {
        buyer_name: 'required',
        email: 'required',
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

    let ticket_sell_data = {
      _id: req.body._id,
      paymentType: req.body.payment_type,
      buyerName: req.body.buyer_name,
      email: req.body.email,
      price: req.body.price,
      cash: req.body.cash,
      atTheDoorstep: req.body.at_the_doorstep,
      ticketId: req.body.ticketId,
      userId: req.user.id,
    }

    let update_ticket_sell = await TicketSellService.update(ticket_sell_data)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_ticket_sell,
      message: 'Ticket Sell Updated Successfully',
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

exports.deleteTicketSell = async (req, res) => {
  try {
    const delete_ticket_sell = await TicketSellService.destory(
      req.params.ticketSellId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_ticket_sell,
      message: 'Ticket sell deleted successfully',
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

exports.getTickets = async (req, res) => {
  try {
    const get_tickets = await TicketSellService.getTickets(req.params.eventId)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_tickets,
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

exports.setCheckIn = async (req, res) => {
  try {
    let set_checkin = await TicketSellService.setCheckIn(req.body.ticketSellId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: set_checkin,
      message: 'Check in set successfully',
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
