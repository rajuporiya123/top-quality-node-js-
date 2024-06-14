const OrderService = require('../services/OrderService')
const Pagination = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const Order = require('../models/Order')
const UserStaff = require('../models/UserStaff')
const Stripe = require('stripe')
const User = require('../models/User')
const TicketSell = require('../models/TicketSell')
const Ticket = require('../models/Ticket')
const Addon = require('../models/Addon')
const { default: mongoose } = require('mongoose')
const Coupon = require('../models/Coupon')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

exports.createOrder = async (req, res) => {
  try {
    let order_data = {
      orderNumber: Date.now(),
      eventId: req.body.eventId,
      organizerId: req.body.organizerId,
      orderDate: new Date(),
      orderType: req.body.orderType,
      orderStatus: req.body.orderStatus,
      attendees: req.body.attendees,
      userId: req.user.id,
      managerId: req.body.managerId,
      ticketId: req.body.ticketId,
    }

    function leftFillNum(num, targetLength) {
      return num.toString().padStart(targetLength, 0)
    }

    for (let i = 0; i < order_data.attendees.length; i++) {
      order_data.attendees[i] = {
        ...order_data.attendees[i],
        barcode: `${order_data.orderNumber}${leftFillNum(i, 3)}`,
      }
    }

    const save_order = await OrderService.create(order_data)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Order Created Successfully',
      data: save_order,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}

exports.getOrderListing = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : ''
    const filter = req.query.filter ? req.query.filter : ''
    const userId = req.user.id

    const get_orders = await OrderService.getOrderListing(
      search,
      filter,
      userId,
      '',
      req.query.eventId
    )
    console.log(get_orders, 'hbsbdjasd')

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    let order_paginator = await Pagination.paginator(get_orders, page, limit)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: order_paginator,
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

exports.getOrderDetails = async (req, res) => {
  try {
    const get_order_details = await OrderService.getOrderDetails(
      req.query.orderId
    )

    let attendees_pagination = await Pagination.paginator(
      get_order_details.attendees,
      req.query.page,
      req.query.limit
    )

    const data = { ...get_order_details, attendees: attendees_pagination }

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: data,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err.message,
      data: [],
    })
  }
}

exports.getMultipleRefunds = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    const get_multiple_refunds = await OrderService.getMultipleRefunds(
      req.query.eventId
    )

    let refund_paginator = await Pagination.paginator(
      get_multiple_refunds,
      page,
      limit
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: refund_paginator,
      message: 'Order Refunded successfully',
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.updateMultipleRefunds = async (req, res) => {
  try {
    const update_multiple_refunds = await OrderService.updateMultipleRefunds(
      req.body
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: update_multiple_refunds,
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

exports.getEventOrders = async (req, res) => {
  try {
    const get_orders = await OrderService.getEventOrders(
      req.query.eventId,
      req.query.search,
      req.query.date,
      req.query.type
    )

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_orders,
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

exports.resendOrderConfirmation = async (req, res) => {
  try {
    const OrderDetails = await OrderService.resendOrderConfirmation(
      req.query.orderId
    )

    const order_data = {
      from: 'contact@carnivalist.com',
      to: req.query.email,
      subject: 'Order confirmation',
      template: 'resend-order-confirmation',
      context: {
        buyerName: OrderDetails.buyerName,
        orderNumber: OrderDetails.orderNumber,
        quantity: OrderDetails.quantity,
        price: OrderDetails.price,
        orderDate: OrderDetails.orderDate,
        orderStatus: OrderDetails.orderStatus,
        deliveryMethod: OrderDetails.deliveryMethod,
        orderType: OrderDetails.orderType,
        attendees: OrderDetails.attendees,
        copyrightYear: new Date().getFullYear(),
      },
    }

    transporter.sendMail(order_data, (err, body) => {
      if (err) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          message: err,
          data: [],
        })
      } else {
        return res.status(200).json({
          success: true,
          statusCode: statuscode.success,
          message: 'Email sent successfully for order confirmation',
        })
      }
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

exports.capture = async (req, res) => {
  try {
    const isAccepted = req.body.isAccepted
    const orderId = req.body.orderId
    const consumerId = req.body.consumerId


    const consumer = await User.findById(consumerId)
   
    if (isAccepted == true) {
      const order = await Order.findOne({
        _id: orderId,
        orderStatus: 'WAITING-FOR-COMMITTEE-MEMBER-APPROVAL',
      })
      console.log(order,"odfsfdfrder")
      var amount = order.totalAmount
      order.orderStatus = 'Completed'
      order.save()
     
      if(order?.appliedCouponId)
      {
        await Coupon.updateOne(
          { _id: order?.appliedCouponId },
          { $inc: { numberOfCouponsUse: order?.appliedCouponQty } }
        )
      }

      for (var i = 0; i < order.attendees.length; i++) {
        const ticket = await Ticket.findById(order.attendees[i].ticketId)
        const capturedQuantity = req.body?.quantityData?.find(obj => obj.id.toString() == ticket._id.toString()).qty;
        if(capturedQuantity <  order.attendees[i].qty )
        {
          if(order?.appliedCouponId)
          {
            for(let j = 0; j <  order.attendees[i].qty-capturedQuantity ; j++)
            { 
              amount = amount - parseInt(order.attendees[i].price[j].price)
              order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal  - parseInt(order.attendees[i].price[j].price)
            }
          }else
          {
            for(let j = 0; j <  order.attendees[i].qty-capturedQuantity ; j++)
            {
              amount = amount - parseInt(order.attendees[i].price)
              order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal - parseInt(order.attendees[i].price)
            }
          }
        }
        order.attendees[i].qty = req.body?.quantityData?.find(obj => obj.id.toString() == ticket._id.toString()).qty;
        ticket.soldTicket = order.attendees[i].qty + ticket.soldTicket
        ticket.save()
        order.save()
        for (var j = 0; j < order.attendees[i].qty; j++) {
          if(order?.appliedCouponId)
          {
            const ticketSell = 
            {
              paymentType:"Paid",
              buyerName:consumer.name,
              email:consumer.username,
              price:`${order.attendees[i].price[j].price}`,
              cash:true,
              atTheDoorstep:false,
              ticketId:order.attendees[i].ticketId,
              eventId:order.eventId,
              userId:consumer._id,
              ticketNumber: Date.now()
            }
            await TicketSell.create(ticketSell)
          }
          else
          {
            const ticketSell = 
            {
              paymentType:"Paid",
              buyerName:consumer.name,
              email:consumer.username,
              price:`${order.attendees[i].price}`,
              cash:true,
              atTheDoorstep:false,
              ticketId:order.attendees[i].ticketId,
              eventId:order.eventId,
              userId:consumer._id,
              ticketNumber: Date.now()
            }
            await TicketSell.create(ticketSell)
          }
        }
      }
      // return
      for (var i = 0; i < order.addonsDetails.length; i++) {
        if (order.addonsDetails[i].variations) {
          const capturedobject = req.body?.addonQuantityData?.find(obj => obj.id.toString() == order.addonsDetails[i].id.toString());
          console.log(capturedobject,"capturedobject")
          for (var j = 0; j < order.addonsDetails[i].variations.length; j++) {
            const capturedQuantity = capturedobject?.variations.find(obj => obj.id.toString() == order.addonsDetails[i].variations[j].id.toString()).qty;
            if(capturedQuantity <  order.addonsDetails[i].variations[j].qty )
            {
              if(order?.appliedCouponId)
              {
                for(let k = 0; k <   order.addonsDetails[i].variations[j].qty-capturedQuantity ; k++)
                {
                  console.log("inside amount variation",amount)
                  console.log("minus AMount",order.addonsDetails[i].variations[j].price[k].price)
                  amount = amount - parseInt(order.addonsDetails[i].variations[j].price[k].price)
                  order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal - parseInt(order.addonsDetails[i].variations[j].price[k].price)
                }
              }
              else
              {
                for(let k = 0; k <   order.addonsDetails[i].variations[j].qty-capturedQuantity ; k++)
                {
                  console.log("inside amount variation",amount)
                  console.log("minus AMount",order.addonsDetails[i].variations[j].price)
                  amount = amount - parseInt(order.addonsDetails[i].variations[j].price)
                  order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal - parseInt(order.addonsDetails[i].variations[j].price)
                }
              }
            }
            await Addon.findOneAndUpdate(
              {
                'variations._id': order.addonsDetails[i].variations[j].id,
                _id: order.addonsDetails[i].id,
              },
              {
                $inc: {
                  'variations.$.soldUnits':
                    order.addonsDetails[i].variations[j].qty,
                },
              }
            )
          }
        } else {
          const capturedQuantity = req.body?.addonQuantityData?.find(obj => obj.id.toString() == order.addonsDetails[i].id.toString()).qty;
          if(capturedQuantity <  order.addonsDetails[i].qty )
          {
            if(order?.appliedCouponId)
            {
              for(let j = 0; j <  order.addonsDetails[i].qty-capturedQuantity ; j++)
              {
                console.log("inside amount",amount)
                console.log("minus AMount",order.addonsDetails[i].price[j].price)
                amount = amount - parseInt(order.addonsDetails[i].price[j].price)
                order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal - parseInt(order.addonsDetails[i].price[j].price)
              }
            }else
            {
              for(let j = 0; j <  order.addonsDetails[i].qty-capturedQuantity ; j++)
              {
                console.log("inside amount",amount)
                console.log("minus AMount",order.addonsDetails[i].price)
                amount = amount - parseInt(order.addonsDetails[i].price)
                order.paymentGatewayCharges.subtotal = order.paymentGatewayCharges.subtotal - parseInt(order.addonsDetails[i].price)
              }
            }
          }
          await Addon.findOneAndUpdate(
            { _id: order.addonsDetails[i].id },
            { $inc: { soldUnits: order.addonsDetails[i].qty } }
          )
        }
      }
      if(order?.Payment?.id)
      { 
        order.totalAmount = amount
        order.save()
        var intent = await stripe.charges.capture(order?.Payment?.id,{amount:Math.round(amount*100)})
        await OrderService.createInvoice(order, consumer)
      }
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Order captured Successfully',
        intent: intent,
      })
    } else {
      
      const order = await Order.findOne({
        _id: orderId,
        orderStatus: 'WAITING-FOR-COMMITTEE-MEMBER-APPROVAL',
      })
      if(order?.Payment?.id)await stripe.refunds.create({ charge: order?.Payment?.id })
      order.orderStatus = 'Canceled'
      order.save()
      return res.status(200).json({
        success: true,
        statusCode: statuscode.success,
        message: 'Order Canceled Successfully',
        intent: intent,
      })
    }

   
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err.message,
      data: [],
    })
  }
}
exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId })
    order.orderStatus = 'Refund'
    order.save()
    const refund = await stripe.refunds.create({ charge: order.Payment.id })
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Capture Successfully',
      intent: refund,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error.message,
      data: [],
    })
  }
}

exports.getWaitingForCommitteeMemberApproval = async (req, res) => {
  try {
    const getOrders = await UserStaff.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'eventData.eventId',
          foreignField: 'eventId',
          as: 'orderData',
        },
      },
      {
        $unwind: {
          path: '$orderData',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'orderData.userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
        },
      },
      {
        $project: {
          orderStatus: '$orderData.orderStatus',
          buyerName: {
            $concat: ['$userData.name', ' ', '$userData.lastName'],
          },
          consumerId: '$userData._id',
          orderId: '$orderData._id',
          tickets: '$orderData.attendees',
          addonsDetails: '$orderData.addonsDetails',
          totalAmount: '$orderData.totalAmount',
        },
      },
      {
        $match: {
          orderStatus: 'WAITING-FOR-COMMITTEE-MEMBER-APPROVAL',
        },
      },
    ])

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    let orderPaginator = await Pagination.paginator(getOrders, page, limit)

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Data retrive successfully',
      data: orderPaginator,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error.message,
      data: [],
    })
  }
}
