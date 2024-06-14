const express = require('express')
const router = express.Router()

const {
  createTicket,
  getAllTicket,
  editTicket,
  deleteTicket,
  updateTicket,
  getTicketOption,
} = require('../controllers/TicketController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/ticketOption/:eventId', tokenValidate(), getTicketOption)

router
  .route('/')
  .post(tokenValidate(), createTicket)
  .get(tokenValidate(), getAllTicket)
  .put(tokenValidate(), updateTicket)

router
  .route('/:ticketId')
  .get(tokenValidate(), editTicket)
  .delete(tokenValidate(), deleteTicket)

module.exports = router
