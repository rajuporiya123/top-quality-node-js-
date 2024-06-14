const express = require('express')
const router = express.Router()

const {
  createEvent,
  updateEvent,
  getAllEvent,
  getEventDetails,
  addEventBanner,
  cancelEvent,
  deleteEvent,
  getDashboard,
  getAllEventForStaffAndCommitteeMember,
  getEventDashboard,
  getPublishEvent,
  getEventGraph,
  updateSlug,
  getEventBySlug,
} = require('../controllers/EventController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/dashboard', tokenValidate(), getDashboard)
router.get('/dashboard/graph', tokenValidate(), getEventGraph)
router.get('/eventDashboard/:eventId', tokenValidate(), getEventDashboard)
router.get('/publishEvent/:eventId', tokenValidate(), getPublishEvent)
router.get(
  '/getStaffAndCommitteeMemberEvent',
  tokenValidate(),
  getAllEventForStaffAndCommitteeMember
)
router.post('/addBanner/:id', tokenValidate(), addEventBanner)
router.post('/cancel/:id', tokenValidate(), cancelEvent)

router.post('/updateSlug', tokenValidate(), updateSlug)
router.get('/getEventBySlug/:slug', tokenValidate(), getEventBySlug)

router
  .route('/')
  .post(tokenValidate(), createEvent)
  .get(tokenValidate(), getAllEvent)
  .put(tokenValidate(), updateEvent)

router
  .route('/:id')
  .get(tokenValidate(), getEventDetails)
  .delete(tokenValidate(), deleteEvent)

module.exports = router
