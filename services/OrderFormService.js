const OrderForm = require('../models/OrderForm')
const mongoose = require('mongoose')

module.exports = class OrderFormService {
  static async create(data) {
    try {
      const create_order_form = await OrderForm.create(data)
      return create_order_form
    } catch (error) {
      console.log(`Could not add order form ${error}`)
      throw error
    }
  }

  static async getOrderForm(eventId) {
    try {
      const get_order_form = await OrderForm.aggregate([
        {
          $project: {
            formType: 1,
            fieldName: 1,
            placeholder: 1,
            isMandatory: 1,
            listDetails: 1,
            eventId: 1,
          },
        },
        {
          $match: {
            eventId: mongoose.Types.ObjectId(eventId),
          },
        },
      ])
      return get_order_form
    } catch (error) {
      console.log(`Could not get order form ${error}`)
      throw error
    }
  }

  static async editOrderForm(orderFormId) {
    try {
      const edit_order_form = await OrderForm.aggregate([
        {
          $project: {
            _id: 1,
            formType: 1,
            fieldName: 1,
            placeholder: 1,
            isMandatory: 1,
            listDetails: 1,
            eventId: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(orderFormId),
          },
        },
      ])
      return edit_order_form
    } catch (error) {
      console.log(`Could not edit order form ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_order_form = await OrderForm.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_order_form
    } catch (error) {
      console.log(`Could not update order form ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let order_form_delete_data = await OrderForm.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return order_form_delete_data
    } catch (error) {
      console.log('Error in deleting order form', error)
      throw error
    }
  }
}
