const InvoiceService = require('../services/InvoiceService')
const Pagination = require('../config/config')
const { statuscode } = require('../config/codeAndMessage')

exports.getInvoiceListing = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : ''

    const get_invoices = await InvoiceService.getInvoiceListing(
      search,
      req.query.eventId,
      req.query.type
    )

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 4

    let invoice_paginator = await Pagination.paginator(
      get_invoices,
      page,
      limit
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: invoice_paginator,
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
