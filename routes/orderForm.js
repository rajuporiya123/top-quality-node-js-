const express = require('express')
const router = express.Router()

const {
  createOrderForm,
  getAllOrderForm,
  editOrderForm,
  updateOrderForm,
  deleteOrderForm,
} = require('../controllers/OrderFormController')

const tokenValidate = require('../middleware/tokencheck')

router
  .route('/:orderFormId')
  .get(tokenValidate(), editOrderForm)
  .delete(tokenValidate(), deleteOrderForm)

router
  .route('/')
  .post(tokenValidate(), createOrderForm)
  .get(tokenValidate(), getAllOrderForm)
  .put(tokenValidate(), updateOrderForm)

module.exports = router
