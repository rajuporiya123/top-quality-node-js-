const express = require('express')
const router = express.Router()

const { getInvoiceListing } = require('../controllers/InvoiceController')
const tokenValidate = require('../middleware/tokencheck')

router.get('/', tokenValidate(), getInvoiceListing)

module.exports = router
