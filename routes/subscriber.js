const express = require('express')
const router = express.Router()

const {
  createSubscriber,
  getAllSubscriber,
  deleteSubscriber,
  editSubscriber,
  updateSubscriber,
  addMultipleSubscriberFromCSV,
} = require('../controllers/SubscriberController')

const tokenValidate = require('../middleware/tokencheck')

router.get(
  '/marketingGoup/:marketingGroupId',
  tokenValidate(),
  getAllSubscriber
)

router.post('/addMultiple', tokenValidate(), addMultipleSubscriberFromCSV)

router
  .route('/:subscriberId')
  .get(tokenValidate(), editSubscriber)
  .delete(tokenValidate(), deleteSubscriber)

router
  .route('/')
  .post(tokenValidate(), createSubscriber)
  .put(tokenValidate(), updateSubscriber)

module.exports = router
