const { default: mongoose } = require('mongoose')
const Invoice = require('../models/Invoice')

module.exports = class InvoiceService {
  static async create(data) {
    try {
      const create_invoice = await Invoice.create(data)
      return create_invoice
    } catch (error) {
      console.log(`Could not create Invoice ${error}`)
      throw error
    }
  }

  static async getInvoiceListing(search,eventId,type) {
    try {
      console.log(type,"type")
      let regex = new RegExp(search, 'i')
      if(type == "Online")
      {
        var get_invoices = await Invoice.aggregate([
          {
            $match: {
              eventId:mongoose.Types.ObjectId(eventId),
              $and: [
                {
                  $or: [{ buyerName: regex }],
                },
              ],
              type:"Online"
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
            $project:{
              buyerName:1,
              eventId:1,
              invoiceNumber:1,
              eventTitle:'$eventsObject.eventTitle',
              price:{$round:["$OnlinePrice",2]},
              invoiceDate:1,
              tickets:"$ticketsQuantity",
              addonQuantity:1,
              createdAt:1
            }
          },
          {
            $sort: { createdAt: -1 },
          },
        ])
        console.log("YASH NAGAR")
      }else
      {
        var get_invoices = await Invoice.aggregate([
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
              eventId:1,
              invoiceNumber: 1,
              eventTitle: '$eventsObject.eventTitle',
              price: 1,
              invoiceDate: 1,
              tickets: '1',
              createdAt: 1,
              type:1
            },
          },
          {
            $match: {
              eventId:mongoose.Types.ObjectId(eventId),
              $and: [
                {
                  $or: [{ buyerName: regex }],
                },
              ],
              type:{$ne:"Online"}
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ])
      }

      return get_invoices
    } catch (error) {
      console.log(`Could not get Orders ${error}`)
      throw error
    }
  }
}
