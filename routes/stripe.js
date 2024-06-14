const express = require('express')
const router = express.Router()

const {
  getStripeState,
  OAuth,
  getStripeAccountId,
  disconnectStripeAccount,
} = require('../controllers/StripeController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/connect/getState', tokenValidate(), getStripeState)
router.post('/connect/oauth', tokenValidate(), OAuth)
router.get('/account/id', tokenValidate(), getStripeAccountId)
router.get('/account/disconnect', tokenValidate(), disconnectStripeAccount)

module.exports = router
