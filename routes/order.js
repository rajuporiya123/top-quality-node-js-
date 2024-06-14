const express = require('express')
const router = express.Router()

const {
  createOrder,
  getOrderListing,
  getOrderDetails,
  getMultipleRefunds,
  updateMultipleRefunds,
  getEventOrders,
  resendOrderConfirmation,
  capture,
  refundOrder,
  getWaitingForCommitteeMemberApproval,
} = require('../controllers/OrderController')

const tokenValidate = require('../middleware/tokencheck')

router.get(
  '/getWaitingForCommitteeMemberApproval',
  tokenValidate(),
  getWaitingForCommitteeMemberApproval
)
router.get('/orderDetails', tokenValidate(), getOrderDetails)
router.get('/eventOrders', tokenValidate(), getEventOrders)
router.post('/capture', tokenValidate(), capture)
router.post('/refund', tokenValidate(), refundOrder)

router.get('/resendOrderConfirmation', tokenValidate(), resendOrderConfirmation)

router
  .route('/multipleRefunds')
  .get(tokenValidate(), getMultipleRefunds)
  .put(tokenValidate(), updateMultipleRefunds)

router
  .route('/')
  .post(tokenValidate(), createOrder)
  .get(tokenValidate(), getOrderListing)

module.exports = router
