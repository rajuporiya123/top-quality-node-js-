const TicketSell = require('../models/TicketSell')
const Ticket = require('../models/Ticket')
const mongoose = require('mongoose')

module.exports = class TicketSellService {
  static async create(data) {
    try {
      const create_ticket_sell = await TicketSell.create(data)
      if (data.cash) {
        const updateTicket = await Ticket.updateOne(
          { _id: mongoose.Types.ObjectId(data.ticketId) },
          {
            paymentType: 'Cash',
          }
        )
      } else {
        const updateTicket = await Ticket.updateOne(
          { _id: mongoose.Types.ObjectId(data.ticketId) },
          {
            paymentType: 'At The Doorstep',
          }
        )
      }

      return create_ticket_sell
    } catch (error) {
      console.log(`Could not add ticket sell ${error}`)
      throw error
    }
  }
  static async getTicketSellListing(eventId, search) {
    try {
      let regex = new RegExp(search, 'i')
      const get_ticket_sell = await TicketSell.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: 'ticketId',
            foreignField: '_id',
            as: 'ticketObject',
          },
        },
        {
          $unwind: '$ticketObject',
        },
        {
          $project: {
            buyerName: 1,
            email: 1,
            ticketType: '$ticketObject.ticketType',
            eventId: 1,
            checkIn: 1,
            ticketNumber: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            $and: [
              {
                $or: [{ buyerName: regex }],
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])

      return get_ticket_sell
    } catch (error) {
      console.log(`Could not get Ticket sell listing ${error}`)
      throw error
    }
  }

  static async editTicketSell(ticketSellId) {
    try {
      const get_ticket_sell = await TicketSell.aggregate([
        {
          $project: {
            paymentType: 1,
            buyerName: 1,
            email: 1,
            price: 1,
            cash: 1,
            atTheDoorstep: 1,
            ticketId: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(ticketSellId),
          },
        },
      ])
      return get_ticket_sell
    } catch (error) {
      console.log(`Could not edit ticket ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_ticket_sell = await TicketSell.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_ticket_sell
    } catch (error) {
      console.log(`Could not update ticket sell ${error}`)
      throw error
    }
  }

  static async destory(id) {
    try {
      let ticket_sell_delete_data = await TicketSell.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return ticket_sell_delete_data
    } catch (error) {
      console.log('Error is ticket sell deleting', error)
      throw error
    }
  }

  static async getTickets(eventId) {
    try {
      const get_tickets = await Ticket.aggregate([
        {
          $project: {
            name: 1,
            eventId: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])
      return get_tickets
    } catch (error) {
      console.log(`Could not get Tickets ${error}`)
      throw error
    }
  }

  static async setCheckIn(ticketSellId) {
    try {
      const set_checkin = await TicketSell.updateOne(
        {
          _id: mongoose.Types.ObjectId(ticketSellId),
        },
        {
          $set: {
            checkIn: true,
          },
        }
      )
      return set_checkin
    } catch (error) {
      console.log(`Could not set check in ${error}`)
      throw error
    }
  }
}
