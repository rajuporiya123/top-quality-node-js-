const Ticket = require('../models/Ticket')
const mongoose = require('mongoose')

module.exports = class TicketService {
  static async create(data) {
    try {
      const create_ticket = await Ticket.create(data)
      return create_ticket
    } catch (error) {
      console.log(`Could not add event member ${error}`)
      throw error
    }
  }

  static async getTicket(eventId) {
    try {
      let get_ticket = await Ticket.aggregate([
        {
          $project: {
            name: 1,
            salesEnd: 1,
            endTime: 1,
            availableQuantity: 1,
            price: 1,
            ticketType: 1,
            eventId: 1,
            ticketSaleType: 1,
            ticketOption: 1,
            soldTicket: 1,
            paymentType: 1,
            salesStart: 1,
            startTime: 1,
            salesChannel: 1,
            availableTickets: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])

      // get_ticket.map(async (t) => {
      //   if (t.availableTickets == 'whensalesendfor') {
      //     const names = get_ticket.filter((t1) => t1.name == t.ticketOption)
      //     const endDay = names[0].salesEnd.getDate()
      //     const endMonth = names[0].salesEnd.getMonth() + 1
      //     const endYear = names[0].salesEnd.getFullYear()
      //     let endHour = parseInt(names[0].endTime.split(':')[0])
      //     const endPmam = names[0].endTime.slice(-2)
      //     if (endPmam == 'PM') {
      //       endHour = endHour + 12
      //     }
      //     const endMin = parseInt(names[0].endTime.split(':')[1].split(' ')[0])

      //     const finalEndDate = new Date(
      //       endYear,
      //       endMonth,
      //       endDay,
      //       endHour,
      //       endMin,
      //       0
      //     )

      //     let nowDate = new Date()
      //     const nowDay = nowDate.getDate()
      //     const nowMonth = nowDate.getMonth() + 1
      //     const nowYear = nowDate.getFullYear()
      //     const nowHours = nowDate.getHours()
      //     const nowMin = nowDate.getMinutes()
      //     const finalNowDate = new Date(
      //       nowYear,
      //       nowMonth,
      //       nowDay,
      //       nowHours,
      //       nowMin,
      //       0
      //     )
      //     if (finalNowDate.getTime() >= finalEndDate.getTime()) {
      //       let nowDate1 = new Date()
      //       let nowHours1 = nowDate1.getHours()
      //       const nowMin1 = nowDate1.getMinutes()
      //       let pmam1
      //       if (nowHours1 > 12) {
      //         pmam1 = 'PM'
      //       } else {
      //         pmam1 = 'AM'
      //       }
      //       nowHours1 = pmam1 == 'PM' ? nowHours1 - 12 : nowHours1
      //       const setTime = `${nowHours1}:${nowMin1} ${pmam1}`

      //       const update_ticket = await Ticket.updateOne(
      //         { _id: t._id },
      //         {
      //           $set: {
      //             ticketSaleType: 'On Sale',
      //             salesStart: Date.now(),
      //             startTime: setTime,
      //             ticketOption: '',
      //             availableTickets: 'Dateandtime',
      //           },
      //         }
      //       )
      //       console.log(update_ticket)
      //     }
      //   }
      // })

      // get_ticket.map(async (t) => {
      //   if (t.availableTickets == 'Dateandtime') {
      //     const startDay = t.salesStart.getDate()
      //     const startMonth = t.salesStart.getMonth() + 1
      //     const startYear = t.salesStart.getFullYear()
      //     let startHour = parseInt(t.startTime.split(':')[0])
      //     const startPmam = t.startTime.slice(-2)
      //     if (startPmam == 'PM') {
      //       startHour = startHour + 12
      //     }
      //     const startMin = parseInt(t.startTime.split(':')[1].split(' ')[0])
      //     const endDay = t.salesEnd.getDate()
      //     const endMonth = t.salesEnd.getMonth() + 1
      //     const endYear = t.salesEnd.getFullYear()
      //     let endHour = parseInt(t.endTime.split(':')[0])
      //     const endPmam = t.endTime.slice(-2)
      //     if (endPmam == 'PM') {
      //       endHour = endHour + 12
      //     }
      //     const endMin = parseInt(t.endTime.split(':')[1].split(' ')[0])

      //     let nowDate = new Date()
      //     const nowDay = nowDate.getDate()
      //     const nowMonth = nowDate.getMonth() + 1
      //     const nowYear = nowDate.getFullYear()
      //     const nowHours = nowDate.getHours()
      //     const nowMin = nowDate.getMinutes()
      //     const finalNowDate = new Date(
      //       nowYear,
      //       nowMonth,
      //       nowDay,
      //       nowHours,
      //       nowMin,
      //       0
      //     )
      //     const finalStartDate = new Date(
      //       startYear,
      //       startMonth,
      //       startDay,
      //       startHour,
      //       startMin,
      //       0
      //     )
      //     const finalEndDate = new Date(
      //       endYear,
      //       endMonth,
      //       endDay,
      //       endHour,
      //       endMin,
      //       0
      //     )

      //     if (
      //       finalStartDate.getTime() <= finalNowDate.getTime() &&
      //       finalEndDate.getTime() > finalNowDate.getTime()
      //     ) {
      //       t.ticketSaleType = 'On Sale'
      //     } else if (finalNowDate.getTime() >= finalEndDate.getTime()) {
      //       t.ticketSaleType = 'Ended'
      //     } else if (finalNowDate.getTime() < finalStartDate.getTime()) {
      //       t.ticketSaleType = 'Scheduled'
      //     }
      //   } else {
      //     const endDay = t.salesEnd.getDate()
      //     const endMonth = t.salesEnd.getMonth() + 1
      //     const endYear = t.salesEnd.getFullYear()
      //     let endHour = parseInt(t.endTime.split(':')[0])
      //     const endPmam = t.endTime.slice(-2)
      //     if (endPmam == 'PM') {
      //       endHour = endHour + 12
      //     }
      //     const endMin = parseInt(t.endTime.split(':')[1].split(' ')[0])

      //     let nowDate = new Date()
      //     const nowDay = nowDate.getDate()
      //     const nowMonth = nowDate.getMonth() + 1
      //     const nowYear = nowDate.getFullYear()
      //     const nowHours = nowDate.getHours()
      //     const nowMin = nowDate.getMinutes()
      //     const finalNowDate = new Date(
      //       nowYear,
      //       nowMonth,
      //       nowDay,
      //       nowHours,
      //       nowMin,
      //       0
      //     )
      //     const finalEndDate = new Date(
      //       endYear,
      //       endMonth,
      //       endDay,
      //       endHour,
      //       endMin,
      //       0
      //     )

      //     if (finalNowDate.getTime() >= finalEndDate.getTime()) {
      //       t.ticketSaleType = 'Ended'
      //     } else {
      //       t.ticketSaleType = 'Scheduled'
      //     }
      //   }
      // })

      return get_ticket
    } catch (error) {
      console.log(`Could not get tickets ${error}`)
      throw error
    }
  }

  static async editTicket(ticketId) {
    try {
      const get_ticket = await Ticket.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: '_id',
            as: 'ticket',
          },
        },
        {
          $unwind: '$ticket',
        },
        {
          $project: {
            name: 1,
            salesStart: 1,
            salesEnd: 1,
            startTime: 1,
            endTime: 1,
            description: 1,
            visibility: 1,
            minimumQuantity: 1,
            maximumQuantity: 1,
            availableTickets: 1,
            salesChannel: 1,
            eTicket: 1,
            willCall: 1,
            wristBand: 1,
            ticketType: 1,
            availableQuantity: 1,
            price: 1,
            ticketOption: 1,
            ticketSaleType: 1,
            showTicketSaleEndDatesAndSaleStatusAtCheckout: 1,
            startShowingOn: 1,
            startShowingTime: 1,
            stopShowingOn: 1,
            endShowingTime: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(ticketId),
          },
        },
      ])
      return get_ticket
    } catch (error) {
      console.log(`Could not edit ticket ${error}`)
      throw error
    }
  }

  static async destory(id) {
    try {
      let ticket_delete_data = await Ticket.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return ticket_delete_data
    } catch (error) {
      console.log('Error is ticket deleting', error)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_ticket = await Ticket.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_ticket
    } catch (error) {
      console.log(`Could not update ticket ${error}`)
      throw error
    }
  }

  static async getTicketOption(eventId) {
    try {
      const get_ticket_option = await Ticket.aggregate([
        {
          $project: {
            name: 1,
            price: 1,
            ticketType: 1,
            eventId: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])
      return get_ticket_option
    } catch (error) {
      console.log(`Could not get ticket option ${error}`)
      throw error
    }
  }

  static async checkTicket(name, eventId) {
    try {
      const checkTicket = await Ticket.aggregate([
        {
          $project: {
            name: 1,
            eventId: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            name: name,
          },
        },
      ])
      console.log('Email Check', checkTicket)
      return checkTicket
    } catch (error) {
      console.log(`Could not fetch Ticket ${error}`)
      throw error
    }
  }
}
