const Event = require('../models/Event')
const Ticket = require('../models/Ticket')
const Addon = require('../models/Addon')
const Coupon = require('../models/Coupon')
const Invoice = require('../models/Invoice')

const mongoose = require('mongoose')
const Order = require('../models/Order')

module.exports = class EventService {
  static async create(data) {
    try {
      const create_event = await Event.create(data)
      return create_event
    } catch (error) {
      console.log(`Could not add event ${error}`)
      throw error
    }
  }

  static async updateEvent(update_data) {
    try {
      let update_user_data = await Event.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_user_data
    } catch (error) {
      console.log('Error in Updationg event', error)
      throw error
    }
  }

  static async getAllEvent(userId, search, status, isDeleted) {
    try {
      let regex = new RegExp(search, 'i')
      let statusObj
      if (status == 'All') {
        statusObj = {
          userId: mongoose.Types.ObjectId(userId),
          isDeleted: isDeleted,
          $and: [
            {
              $or: [{ eventTitle: regex }],
            },
          ],
        }
      } else {
        statusObj = {
          userId: mongoose.Types.ObjectId(userId),
          status: status,
          isDeleted: isDeleted,
          $and: [
            {
              $or: [{ eventTitle: regex }],
            },
          ],
        }
      }

      let get_event = await Event.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'eventId',
            as: 'ticketArray',
          },
        },
        {
          $lookup: {
            from: 'ticketsells',
            localField: '_id',
            foreignField: 'eventId',
            as: 'ticketSellArray',
          },
        },
        {
          $project: {
            _id: 1,
            isDeleted: 1,
            eventTitle: 1,
            userId: 1,
            organizerId: 1,
            startDate: {
              $cond: {
                if: { $eq: ['$startDate', null] },
                then: '',
                else: '$startDate',
              },
            },
            startTime: 1,
            endDate: {
              $cond: {
                if: { $eq: ['$endDate', null] },
                then: '',
                else: '$endDate',
              },
            },
            endTime: 1,
            currency: 1,
            status: 1,
            isCancelled: 1,
            toBeAnnouncedDate: 1,
            isCommitteeMember: 1,
            createdAt: 1,
            slug:1,
            banner: { $concat: [process.env.EVENT_BANNER, '$banner'] },
            soldTickets: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticket',
                  in: {
                    $cond: {
                      if: { $eq: ['$$ticket.soldTicket', ''] },
                      then: { $toInt: '0' },
                      else: { $toInt: '$$ticket.soldTicket' },
                    },
                  },
                },
              },
            },
            totalTickets: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticketQuantity',
                  in: { $toInt: '$$ticketQuantity.availableQuantity' },
                },
              },
            },
            // gross: {
            //   $sum: {
            //     $map: {
            //       input: '$ticketArray',
            //       as: 'ticket',
            //       in: {
            //         $multiply: [
            //           {
            //             $cond: {
            //               if: { $eq: ['$$ticket.soldTicket', ''] },
            //               then: { $toInt: '0' },
            //               else: { $toInt: '$$ticket.soldTicket' },
            //             },
            //           },
            //           {
            //             $cond: {
            //               if: { $eq: ['$$ticket.price', 'Free'] },
            //               then: {
            //                 $add: { $toDouble: '0' },
            //               },
            //               else: {
            //                 $add: { $toDouble: '$$ticket.price' },
            //               },
            //             },
            //           },
            //         ],
            //       },
            //     },
            //   },
            // },
            gross: {
              $sum: {
                $map: {
                  input: '$ticketSellArray',
                  as: 'sell',
                  in: {
                    $cond: {
                      if: { $eq: ['$$sell.price', null] },
                      then: {
                        $add: { $toInt: '0' },
                      },
                      else: {
                        $cond: {
                          if: { $eq: ['$$sell.price', 'Free'] },
                          then: {
                            $add: { $toInt: '0' },
                          },
                          else: {
                            $add: { $toInt: '$$sell.price' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $match: statusObj,
        },
        { $sort: { createdAt: -1 } },
      ])

      // get_event.map((e) => {
      //   if (e.toBeAnnouncedDate == false) {
      //     if (e.status == 'Live') {
      //       const endDay = e.endDate.getDate()
      //       const endMonth = e.endDate.getMonth() + 1
      //       const endYear = e.endDate.getFullYear()
      //       let endHour = parseInt(e.endTime.split(':')[0])
      //       const endPmam = e.endTime.slice(-2)
      //       if (endPmam == 'PM') {
      //         endHour = endHour + 12
      //       }
      //       const endMin = parseInt(e.endTime.split(':')[1].split(' ')[0])
      //       const finalEndDate = new Date(
      //         endYear,
      //         endMonth,
      //         endDay,
      //         endHour,
      //         endMin,
      //         0
      //       )

      //       const finalNowDate = new Date()

      //       if (finalEndDate.getTime() < finalNowDate.getTime()) {
      //         e.status = 'Past'
      //       }
      //     }
      //   } else if (e.toBeAnnouncedDate == true && e.isCancelled == false) {
      //     e.status = 'Draft'
      //   } else if (e.toBeAnnouncedDate == true && e.isCancelled == true) {
      //     e.status = 'Past'
      //   }

      //   if (e.publishEvent == 'Publish Now') {
      //     e.status = 'Live'
      //   } else if (e.publishEvent == 'Schedule for later') {
      //     const startDay = e.publishStartDate.getDate()
      //     const startMonth = e.publishStartDate.getMonth() + 1
      //     const startYear = e.publishStartDate.getFullYear()
      //     let startHour = parseInt(e.publishStartTime.split(':')[0])
      //     const startPmam = e.publishStartTime.slice(-2)
      //     if (startPmam == 'PM') {
      //       startHour = startHour + 12
      //     }
      //     const startMin = parseInt(
      //       e.publishStartTime.split(':')[1].split(' ')[0]
      //     )
      //     const finalStartDate = new Date(
      //       startYear,
      //       startMonth,
      //       startDay,
      //       startHour,
      //       startMin,
      //       0
      //     )
      //     const finalNowDate = new Date()
      //     if (finalStartDate.getTime() < finalNowDate.getTime()) {
      //       e.status = 'Live'
      //       e.publishEvent = 'Publish Now'
      //     } else if (finalStartDate.getTime() >= finalNowDate.getTime()) {
      //       e.status = 'Draft'
      //     }
      //   }
      // })

      // if (status == 'Live') {
      //   get_event.filter((e) => (e.status = 'Live'))
      // }

      return get_event
    } catch (error) {
      console.log('Error in Updationg event', error)
      throw error
    }
  }

  static async getSingleEvent(eventId, banner) {
    try {
      if (banner != '') {
        let get_single_event = await Event.aggregate([
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
              _id: mongoose.Types.ObjectId(eventId),
            },
          },
        ])
        return get_single_event
      } else {
        let get_single_event = await Event.aggregate([
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
              banner: 1,
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
              _id: mongoose.Types.ObjectId(eventId),
            },
          },
        ])
        return get_single_event
      }
    } catch (error) {
      console.log('Error in Updationg event', error)
      throw error
    }
  }

  static async addEventBanner(update_data, eventId) {
    try {
      let add_banner_data = await Event.updateOne(
        { _id: mongoose.Types.ObjectId(eventId) },
        { banner: update_data }
      )
      return add_banner_data
    } catch (error) {
      console.log('Error in Adding event banner', error)
      throw error
    }
  }

  static async cancelEvent(eventId, isCancelled) {
    try {
      let cancel_event = await Event.updateOne(
        { _id: mongoose.Types.ObjectId(eventId) },
        { isCancelled: isCancelled, status: 'Past' }
      )
      return cancel_event
    } catch (error) {
      console.log('Error in cancel event', error)
      throw error
    }
  }

  static async deleteEvent(eventId) {
    try {
      let delete_event = await Event.deleteOne({
        _id: mongoose.Types.ObjectId(eventId),
      })
      return delete_event
    } catch (error) {
      console.log('Error in delete event', error)
      throw error
    }
  }

  static async getEventDashboard(eventId) {
    try {
      const ticketDetails = await Ticket.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
        {
          $project: {
            name: 1,
            soldTicket: 1,
            availableQuantity: 1,
            ticketType: 1,
            price: 1,
            eventId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
      ])

      const addonsDetails = await Addon.aggregate([
        {
          $project: {
            name: 1,
            soldUnits: 1,
            totalQuantity: 1,
            eventId: 1,
            variations: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])

      const eventDetails = await Event.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'eventId',
            as: 'ticketArray',
          },
        },
        {
          $lookup: {
            from: 'addons',
            localField: '_id',
            foreignField: 'eventId',
            as: 'addonArray',
          },
        },
        {
          $project: {
            eventTitle: 1,
            startDate: 1,
            startTime: 1,
            status: 1,
            ticketSold: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticket',
                  in: {
                    $cond: {
                      if: { $eq: ['$$ticket.soldTicket', ''] },
                      then: { $toInt: '0' },
                      else: { $toInt: '$$ticket.soldTicket' },
                    },
                  },
                },
              },
            },
            freeTicketSoldCount: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticket',
                  in: {
                    $multiply: [
                      {
                        $cond: {
                          if: { $eq: ['$$ticket.soldTicket', ''] },
                          then: { $toInt: '0' },
                          else: { $toInt: '$$ticket.soldTicket' },
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ['$$ticket.price', 'Free'] },
                          then: {
                            $add: { $toInt: '1' },
                          },
                          else: {
                            $add: { $toInt: '0' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            ticketGross: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticket',
                  in: {
                    $multiply: [
                      {
                        $cond: {
                          if: { $eq: ['$$ticket.soldTicket', ''] },
                          then: { $toInt: '0' },
                          else: { $toInt: '$$ticket.soldTicket' },
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ['$$ticket.price', 'Free'] },
                          then: {
                            $add: { $toInt: '0' },
                          },
                          else: {
                            $add: { $toInt: '$$ticket.price' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            addonSold: {
              $sum: {
                $map: {
                  input: '$addonArray',
                  as: 'addon',
                  in: {
                    $cond: {
                      if: { $eq: ['$$addon.soldUnits', ''] },
                      then: { $toInt: '0' },
                      else: { $toInt: '$$addon.soldUnits' },
                    },
                  },
                },
              },
            },
            addonGross: {
              $sum: {
                $map: {
                  input: '$addonArray',
                  as: 'addon',
                  in: {
                    $multiply: [
                      {
                        $cond: {
                          if: { $eq: ['$$addon.soldUnits', ''] },
                          then: { $toInt: '0' },
                          else: { $toInt: '$$addon.soldUnits' },
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ['$$addon.price', ''] },
                          then: {
                            $add: { $toInt: '0' },
                          },
                          else: {
                            $add: { $toInt: '$$addon.price' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            _id: 1,
          },
        },
        {
          $addFields: {
            gross: { $add: ['$ticketGross', '$addonGross'] },
            paidTicketSoldCount: {
              $subtract: ['$ticketSold', '$freeTicketSoldCount'],
            },
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(eventId),
          },
        },
      ])

      const couponDetails = await Coupon.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
        {
          $count: 'coupon_count',
        },
      ])

      const ordersDetails = await Order.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'eventsObject',
          },
        },
        {
          $unwind: '$eventsObject',
        },
        {
          $lookup: {
            from: 'tickets',
            localField: 'eventId',
            foreignField: 'eventId',
            as: 'ticketArray',
          },
        },
        {
          $project: {
            eventId: 1,
            orderNumber: 1,
            eventTitle: '$eventsObject.eventTitle',
            orderDate: 1,
            createdAt: 1,
            totalTickets: {
              $sum: {
                $map: {
                  input: '$ticketArray',
                  as: 'ticketQuantity',
                  in: { $toInt: '$$ticketQuantity.availableQuantity' },
                },
              },
            },
            soldTickets: {
              $sum: {
                $map: {
                  input: '$attendees',
                  as: 'value',
                  in: { $toInt: '$$value.qty' },
                },
              },
            },
            // soldTickets: {
            //   $size: '$attendees',
            // },
            // price: {
            //   $sum: {
            //     $map: {
            //       input: '$attendees',
            //       as: 'attendee',
            //       in: {
            //         $cond: {
            //           if: { $eq: ['$$attendee.price', 'Free'] },
            //           then: {
            //             $add: { $toInt: '0' },
            //           },
            //           else: {
            //             $add: { $toInt: '$$attendee.price' },
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
            price: '$totalAmount',
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
      ])

      const invoiceDetails = await Invoice.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'eventsObject',
          },
        },
        {
          $unwind: '$eventsObject',
        },
        {
          $project: {
            buyerName: 1,
            eventId: 1,
            invoiceNumber: 1,
            eventTitle: '$eventsObject.eventTitle',
            price: 1,
            invoiceDate: 1,
            tickets: '1',
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

      return {
        ticketDetails,
        addonsDetails,
        eventDetails,
        couponDetails,
        ordersDetails,
        invoiceDetails,
      }
    } catch (error) {
      console.log('Error in getEventDashboard', error)
    }
  }

  static async ticketSoldCount(userId) {
    try {
      const ticket_sold = await Event.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'eventId',
            as: 'ticketDetails',
            pipeline: [
              {
                $lookup: {
                  from: 'ticketsells',
                  localField: '_id',
                  foreignField: 'ticketId',
                  as: 'tickeSales',
                  pipeline: [
                    {
                      $project: {
                        price: {
                          $cond: {
                            if: { $eq: ['$price', 'Free'] },
                            then: 0,
                            else: {
                              $cond: {
                                if: { $eq: ['$price', null] },
                                then: 0,
                                else: {
                                  $convert: { input: '$price', to: 'int' },
                                },
                              },
                            },
                          },
                        },
                        ticketId: 1,
                      },
                    },
                    {
                      $group: {
                        _id: '$ticketId',
                        Sales: { $sum: '$price' },
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  tickeSales: { $arrayElemAt: ['$tickeSales', 0] },
                },
              },
              {
                $project: {
                  tickeSales: '$tickeSales.Sales',
                  // tickeSales:"$ticketSales.Sales",
                  name: 1,
                  availableQuantity: 1,
                  soldTicket: 1,
                  price: 1,
                },
              },
            ],
          },
        },

        // {
        //   $addFields:{
        //    IntTickets:{
        //     $map: {
        //       input: "$ticketSells",
        //       as: "value",
        //       // in: {$cond:{ $convert: { input: "$$value.price", to: "int" } }}
        //       in: {
        //         $cond: { if: { $eq: [ "$$value.price", "Free" ] }, then: 0, else: { $convert: { input: "$$value.price", to: "int" } } }
        //       }
        //     }
        //    }
        //   }
        // },
        {
          $project: {
            _id: 1,
            isDeleted: 1,
            eventTitle: 1,
            userId: 1,
            currency: 1,
            'ticketDetails.name': 1,
            'ticketDetails._id': 1,
            'ticketDetails.availableQuantity': 1,
            'ticketDetails.soldTicket': 1,
            'ticketDetails.price': 1,
            'ticketDetails.tickeSales': 1,
            // ticketSales:{$sum:"$IntTickets"}
            // "graphValue":{$arrayElemAt:["$graphValue.ticketSold",0]}
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
      ])

      return ticket_sold
    } catch (error) {
      console.log('Error in Updationg event', error)
      throw error
    }
  }
  static async eventGraph(eventId, userId, ticketId, filter) {
    try {
      if (ticketId) {
        var ticket = {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            _id: mongoose.Types.ObjectId(ticketId),
            isDeleted: false,
          },
        }
      } else {
        var ticket = {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            isDeleted: false,
          },
        }
      }
      if (filter == 'day') {
        var ticketGroup = {
          // date :{$dateToString: { format: "%Y-%m-%d", date: "$createdAt"}},
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          // dayOfWeek: { $dayOfWeek: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
        }
        var date = {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }
        var ticketMatch = {
          $match: {
            '_id.day': date.day,
            '_id.month': date.month,
            '_id.year': date.year,
          },
        }
      } else if (filter == 'weekly') {
        var ticketGroup = {
          // date :{$dateToString: { format: "%Y-%m-%d", date: "$createdAt"}},
          year: { $year: '$createdAt' },
          // month: { $month: "$createdAt" },
          // dayOfWeek: { $dayOfWeek: '$createdAt' },
          week: { $week: { date: '$createdAt' } },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
        }
        let currentDate = new Date()
        let startDate = new Date(currentDate.getFullYear(), 0, 1)
        var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000))

        var weekNumber = Math.ceil(days / 7)
        var date = {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }
        var ticketMatch = {
          $match: {
            // "_id.month":date.month,
            '_id.year': date.year,
            '_id.week': weekNumber,
          },
        }
      } else {
        var ticketGroup = {
          // date :{$dateToString: { format: "%Y-%m-%d", date: "$createdAt"}},
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          // dayOfWeek: { $dayOfWeek: "$createdAt" }
        }
        ticketMatch = {
          $match: {
            '_id.year': new Date().getFullYear(),
          },
        }
      }
      return Event.aggregate([
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'eventId',
            as: 'graphValue',
            pipeline: [
              {
                $lookup: {
                  from: 'events',
                  localField: 'eventId',
                  foreignField: '_id',
                  as: 'EventDetail',
                },
              },
              {
                $unwind: '$EventDetail',
              },
              {
                $lookup: {
                  from: 'ticketsells',
                  localField: '_id',
                  foreignField: 'ticketId',
                  as: 'ticketSellDetails',
                  pipeline: [
                    {
                      $project: {
                        price: {
                          $cond: {
                            if: { $eq: ['$price', 'Free'] },
                            then: 0,
                            else: {
                              $cond: {
                                if: { $eq: ['$price', null] },
                                then: 0,
                                else: {
                                  $convert: { input: '$price', to: 'int' },
                                },
                              },
                            },
                          },
                        },
                        current_week: { $week: new Date() },
                        createdAt: 1,
                      },
                    },
                    {
                      $group: {
                        _id: ticketGroup,
                        sales: { $sum: '$price' },
                      },
                    },
                    ticketMatch,
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  isDeleted: '$EventDetail.isDeleted',
                  eventId: '$EventDetail._id',
                  userId: 1,
                  name: 1,
                  ticketSellDetails: 1,
                  createdAt: 1,
                  ticketSold: {
                    $cond: {
                      if: { $eq: ['$soldTicket', ''] },
                      then: { $toInt: '0' },
                      else: { $toInt: '$soldTicket' },
                    },
                  },
                  sellPrice: { $sum: '$ticketSellDetails.sales' },
                },
              },
              // ticket,
              {
                $group: {
                  _id: '$userId',
                  ticketSold: {
                    $push: {
                      ticketID: '$_id',
                      ticketName: '$name',
                      totalSales: '$sellPrice',
                      ticketSellDetails: '$ticketSellDetails',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            graphValue: { $arrayElemAt: ['$graphValue', 0] },
            staffDetails: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(eventId),
          },
        },
      ])
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async getPublishEvent(eventId) {
    try {
      const data = await Ticket.aggregate([
        {
          $project: {
            _id: 1,
            price: 1,
            eventId: 1,
            availableQuantity: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])
      return data
    } catch (error) {
      console.log(`Could not fetch data`)
      throw error
    }
  }
}
