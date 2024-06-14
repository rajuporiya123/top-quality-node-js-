const Order = require('../models/Order')
const TicketSell = require('../models/TicketSell')
const mongoose = require('mongoose')
const Stripe = require('stripe')
const Invoice = require('../models/Invoice')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

module.exports = class OrderService {
  static async create(data) {
    try {
      const create_order = await Order.create(data)
      return create_order
    } catch (error) {
      console.log(`Could not create order ${error}`)
      throw error
    }
  }

  static async getOrderListing(search, filter, userId, globalSearch, eventId) {
    try {
      // console.log(search,filter,userId,globalSearch,eventId,"<<<<<<<<>>>>>>>>>>")
      let regex = new RegExp(search, 'i')
      let globalSearchRegex = new RegExp(globalSearch, 'i')

      let matchObj
      if (globalSearch) {
        matchObj = {
          orderStatus: 'Completed',
          managerId: mongoose.Types.ObjectId(userId),
          $or: [
            { eventTitle: globalSearchRegex },
            {
              firstName: globalSearchRegex,
            },
            {
              lastName: globalSearchRegex,
            },
            {
              email: globalSearchRegex,
            },
            {
              orderId: globalSearchRegex,
            },
          ],
        }
      } else if (eventId == '') {
        matchObj = {
          orderStatus: 'Completed',
          managerId: mongoose.Types.ObjectId(userId),
          eventTitle: regex,
          // eventId:mongoose.Types.ObjectId(eventId)
        }
      } else {
        matchObj = {
          managerId: mongoose.Types.ObjectId(userId),
          eventTitle: regex,
          eventId: mongoose.Types.ObjectId(eventId),
          orderStatus: 'Completed',
        }
      }

      let get_orders = await Order.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'eventsObject',
          },
        },
        // {
        //   $unwind: '$eventsObject',
        // },
        {
          $unwind: {
            path: '$eventsObject',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'organizers',
            localField: 'organizerId',
            foreignField: '_id',
            as: 'organizerDetail',
          },
        },
        // {
        //   $unwind: '$organizerDetail',
        // },
        {
          $unwind: {
            path: '$organizerDetail',
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $lookup: {
        //     from: 'tickets',
        //     localField: 'eventsObject._id',
        //     foreignField: 'eventId',
        //     as: 'ticketDetail',
        //   },
        // },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },
        {
          $unwind: '$userDetail',
        },
        {
          $project: {
            firstName: '$userDetail.name',
            lastName: '$userDetail.lastName',
            email: '$userDetail.username',
            managerId: 1,
            orderId: '$orderNumber',
            eventTitle: '$eventsObject.eventTitle',
            orderDate: 1,
            eventId: 1,
            userId: 1,
            createdAt: 1,
            orderStatus: 1,
            organizerName: '$organizerDetail.organizerName',
            price: '$totalAmount',
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
            ticketTotal: {
              $size: '$attendees',
            },
          },
        },
        {
          $match: matchObj,
        },
        {
          $sort: { createdAt: -1 },
        },
      ])

      if (filter == '90 days') {
        let compareDate = new Date()
        compareDate.setDate(compareDate.getDate() - 90)

        get_orders = get_orders.filter((o) => {
          return o.orderDate.getTime() >= compareDate.getTime()
        })
      } else if (filter == '180 days') {
        let compareDate = new Date()
        compareDate.setDate(compareDate.getDate() - 180)

        get_orders = get_orders.filter((o) => {
          return o.orderDate.getTime() >= compareDate.getTime()
        })
      } else if (filter == '270 days') {
        let compareDate = new Date()
        compareDate.setDate(compareDate.getDate() - 270)

        get_orders = get_orders.filter((o) => {
          return o.orderDate.getTime() >= compareDate.getTime()
        })
      }

      return get_orders
    } catch (error) {
      console.log(`Could not get Orders ${error}`)
      throw error
    }
  }

  static async getOrderDetails(orderId) {
    try {
      let OrderDetails = await Order.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(orderId),
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
        // {
        //   $unwind: '$eventsObject',
        // },
        {
          $unwind: {
            path: '$eventsObject',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'organizers',
            localField: 'organizerId',
            foreignField: '_id',
            as: 'organizerDetail',
          },
        },
        // {
        //   $unwind: '$organizerDetail',
        // },
        {
          $unwind: {
            path: '$organizerDetail',
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $lookup: {
        //     from: 'tickets',
        //     localField: 'ticketId',
        //     foreignField: '_id',
        //     as: 'ticketDetail',
        //   },
        // },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },
        {
          $unwind: '$userDetail',
        },
        {
          $project: {
            orderNumber: 1,
            userName: {
              $concat: ['$userDetail.name', ' ', '$userDetail.lastName'],
            },
            userEmail: '$userDetail.username',
            eventTitle: '$eventsObject.eventTitle',
            toBeAnnounced: '$eventsObject.toBeAnnounced',
            address: '$eventsObject.address',
            startDate: '$eventsObject.startDate',
            startTime: '$eventsObject.startTime',
            endDate: '$eventsObject.endDate',
            endTime: '$eventsObject.endTime',
            orderDate: 1,
            eventId: 1,
            organizerName: '$organizerDetail.organizerName',
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
            ticketTotal: {
              $sum: {
                $map: {
                  input: '$attendees',
                  as: 'value',
                  in: { $toInt: '$$value.qty' },
                },
              },
            },
            attendees: 1,
            paymentType: 'Online',
            appliedCouponId:1
          },
        },
      ])

      // let attendees = await Order.aggregate([
      //   // {
      //   //   $lookup: {
      //   //     from: 'events',
      //   //     localField: 'eventId',
      //   //     foreignField: '_id',
      //   //     as: 'eventsObject',
      //   //   },
      //   // },
      //   // {
      //   //   $unwind: {
      //   //     path: '$eventsObject',
      //   //     preserveNullAndEmptyArrays: true,
      //   //   },
      //   // },
      //   {
      //     $lookup: {
      //       from: 'tickets',
      //       localField: 'ticketId',
      //       foreignField: '_id',
      //       as: 'ticketDetail',
      //     },
      //   },
      //   {
      //     $unwind: '$ticketDetail',
      //   },
      //   // {
      //   //   $lookup: {
      //   //     from: 'users',
      //   //     localField: 'userId',
      //   //     foreignField: '_id',
      //   //     as: 'userDetail',
      //   //   },
      //   // },
      //   // {
      //   //   $unwind: '$userDetail',
      //   // },
      //   {
      //     $project: {
      //       attendees: 1,
      //       paymentType: 'Online',
      //       ticketType: '$ticketDetail.ticketType',
      //       price: '$ticketDetail.price',
      //     },
      //   },
      //   {
      //     $match: {
      //       _id: mongoose.Types.ObjectId(orderId),
      //     },
      //   },
      // ])

      OrderDetails = OrderDetails[0]
      // attendees = attendees[0]

      return OrderDetails
    } catch (error) {
      console.log(`Could not get Orders ${error}`)
      throw error
    }
  }

  static async getMultipleRefunds(eventId) {
    try {
      const get_multiple_refunds = await Order.aggregate([
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
        // {
        //   $lookup: {
        //     from: 'tickets',
        //     localField: 'eventId',
        //     foreignField: 'eventId',
        //     as: 'ticketArray',
        //   },
        // },
        {
          $project: {
            eventId: 1,
            orderNumber: 1,
            orderDate: 1,
            refundDate: 1,
            refundStatus: 1,
            buyer: 'Online',
            soldTickets: {
              $size: '$attendees',
            },
            total: '$totalAmount',
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])

      console.log(get_multiple_refunds)

      return get_multiple_refunds
    } catch (error) {
      console.log(`Could not get Orders ${error}`)
      throw error
    }
  }

  static async updateMultipleRefunds(data) {
    try {
      let update_multiple_refunds
      for (let i = 0; i < data.orderIds.length; i++) {
        update_multiple_refunds = await Order.findOneAndUpdate(
          {
            eventId: mongoose.Types.ObjectId(data.eventId),
            _id: mongoose.Types.ObjectId(data.orderIds[i]),
          },
          {
            $set: {
              refundStatus: 'Refunded',
              orderStatus: 'Refund',
              refundDate: Date.now(),
            },
          }
        )
        stripe.refunds.create({ charge: update_multiple_refunds?.Payment?.id }).then((data)=>{
          console.log("refunded")
        }).catch(async(err)=>{
          if(err)
          {
            await stripe.refunds.create({payment_intent: update_multiple_refunds?.Payment?.payment_intent});
          }
        })

      }
      return update_multiple_refunds
    } catch (error) {
      console.log(`Could not update variation ${error}`)
      throw error
    }
  }

  static async getEventOrders(eventId, search, date, type) {
    try {
      // let getOfflineOrders = await TicketSell.aggregate([
      //   {
      //     $lookup: {
      //       from: 'tickets',
      //       localField: 'ticketId',
      //       foreignField: '_id',
      //       as: 'ticketDetail',
      //     },
      //   },
      //   {
      //     $unwind: '$ticketDetail',
      //     preserveNullAndEmptyArrays: true,
      //   },
      //   {
      //     $project: {
      //       buyerName: 1,
      //       orderNumber: '$ticketNumber',
      //       quantity: '1',
      //       ticketName: '$ticketDetail.name',
      //       price: 1,
      //       orderDate: '$createdAt',
      //       eventId: 1,
      //       deliveryMethod: {
      //         $cond: {
      //           if: { $eq: ['$atTheDoorstep', true] },
      //           then: 'At The Doorstep',
      //           else: 'Cash',
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $match: {
      //       eventId: mongoose.Types.ObjectId(eventId),
      //     },
      //   },
      // ])

      date = date == 'all' ? '' : date
      let regex = new RegExp(search, 'i')
      let typeRegex = new RegExp(type, 'i')
      let dateRegex = new RegExp(date, 'i')

      let getOnlineOrders = await Order.aggregate([
        // {
        //   $lookup: {
        //     from: 'tickets',
        //     localField: 'ticketId',
        //     foreignField: '_id',
        //     as: 'ticketDetail',
        //   },
        // },
        // {
        //   $unwind: '$ticketDetail',
        //   // preserveNullAndEmptyArrays: true,
        //   // preserveNullAndEmptyArrays: true,
        // },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },
        {
          $unwind: '$userDetail',
          // preserveNullAndEmptyArrays: true,
        },
        {
          $project: {
            buyerName: {
              $concat: ['$userDetail.name', ' ', '$userDetail.lastName'],
            },
            quantity: {
              $size: '$attendees',
            },
            orderNumber: 1,
            // sales: {
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
            sales: '$totalAmount',
            addonsDetails: 1,
            attendees: 1,
            orderDate: 1,
            eventId: 1,
            orderStatus: 1,
            deliveryMethod: 'eTicket',
            orderType: 1,
            year: { $toString: { $year: '$orderDate' } },
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
            $and: [
              { orderNumber: regex },
              { orderStatus: typeRegex },
              { year: dateRegex },
            ],
          },
        },
      ])
      return getOnlineOrders
    } catch (error) {
      console.log(`Could not get Orders ${error}`)
      throw error
    }
  }

  static async resendOrderConfirmation(orderId) {
    try {
      let getOrderDetails = await Order.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },
        {
          $unwind: '$userDetail',
        },
        {
          $project: {
            quantity: {
              $size: '$attendees',
            },
            buyerName: {
              $concat: ['$userDetail.name', ' ', '$userDetail.lastName'],
            },
            orderNumber: 1,
            // sales: {
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
            attendees: 1,
            orderDate: 1,
            eventId: 1,
            orderStatus: 1,
            deliveryMethod: 'eTicket',
            orderType: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(orderId),
          },
        },
      ])
      return getOrderDetails[0]
    } catch (error) {
      console.log(`Could not get Order Details ${error}`)
      throw error
    }
  }
  static createInvoice = async(order,customer)=>{
    try{
      let ticketsQuantity = 0 
      let addonQuantity = 0 
      for (let i = 0; i < order.attendees.length; i++) {
        ticketsQuantity += order.attendees[i].qty
      }
      for (let i = 0; i < order.addonsDetails.length; i++) {
        if(order.addonsDetails[i].variations)
        {
          for (let j = 0; j < order.addonsDetails[i].variations.length; j++) {
            addonQuantity += order.addonsDetails[i].variations[j].qty
          }
        }else
        {
          addonQuantity += order.addonsDetails[i].qty
        }
      }
      console.log(ticketsQuantity,addonQuantity,"addonQuantity")
      const data = {
        buyerName:`${customer.name} ${customer.lastName}`,
        orderId : order._id,
        eventId:order.eventId,
        ticketsQuantity : ticketsQuantity,
        addonQuantity:addonQuantity,
        invoiceNumber:Date.now(),
        userId :order.userId,
        OnlinePrice: order.totalAmount,
        type:"Online"
      }
      await Invoice.create(data)
    }catch(error)
    {
      console.log(error)
    }
  }
}
