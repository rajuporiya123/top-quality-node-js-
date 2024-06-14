const OrderFormService = require('../services/OrderFormService')
const { Validator } = require('node-input-validator')
const { statuscode } = require('../config/codeAndMessage')

exports.createOrderForm = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      form_type: 'required',
      field_name: 'required',
      placeholder: 'required',
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

    let create_order_form = {
      formType: req.body.form_type,
      fieldName: req.body.field_name,
      placeholder: req.body.placeholder,
      isMandatory: req.body.isMandatory,
      listDetails: req.body.list_details,
      eventId: req.body.eventId,
    }

    let orderForm = await OrderFormService.create(create_order_form)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: orderForm,
      message: 'Order Form Created Successfully',
    })
  } catch (error) {
    console.log('err', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.getAllOrderForm = async (req, res) => {
  try {
    const get_order_form = await OrderFormService.getOrderForm(
      req.query.eventId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_order_form,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log('err', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.editOrderForm = async (req, res) => {
  try {
    const edit_order_form = await OrderFormService.editOrderForm(
      req.params.orderFormId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_order_form[0],
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

exports.deleteOrderForm = async (req, res) => {
  try {
    const delete_order_form = await OrderFormService.destroy(
      req.params.orderFormId
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_order_form,
      message: 'Order Form deleted successfully',
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

exports.updateOrderForm = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      form_type: 'required',
      field_name: 'required',
      placeholder: 'required',
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

    let update_order_form = {
      _id: req.body.orderFormId,
      formType: req.body.form_type,
      fieldName: req.body.field_name,
      placeholder: req.body.placeholder,
      isMandatory: req.body.isMandatory,
      listDetails: req.body.list_details,
      eventId: req.body.eventId,
    }

    let orderForm = await OrderFormService.update(update_order_form)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: orderForm,
      message: 'Order Form Updated Successfully',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
