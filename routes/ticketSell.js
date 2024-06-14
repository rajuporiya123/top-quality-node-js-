const express = require('express')
const router = express.Router()

const {
  createTicketSell,
  getTicketSellListing,
  editTicketSell,
  updateTicketSell,
  deleteTicketSell,
  getTickets,
  setCheckIn,
} = require('../controllers/TicketSellController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/tickets/:eventId', tokenValidate(), getTickets)
router.put('/checkin', tokenValidate(), setCheckIn)

router
  .route('/')
  .post(tokenValidate(), createTicketSell)
  .get(tokenValidate(), getTicketSellListing)
  .put(tokenValidate(), updateTicketSell)

router
  .route('/:ticketSellId')
  .get(tokenValidate(), editTicketSell)
  .delete(tokenValidate(), deleteTicketSell)

module.exports = router
