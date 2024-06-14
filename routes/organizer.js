const express = require('express')
const router = express.Router()

const {
  createOrganizer,
  getOrganizer,
  editOrganizer,
  updateOrganizer,
  deleteOrganizer,
  removeOrganizerLogo,getOrganizerListForEvent
} = require('../controllers/OrganizerController')

const tokenValidate = require('../middleware/tokencheck')

router.post(
  '/remove/organizerProfileImage/:organizerId',
  tokenValidate(),
  removeOrganizerLogo
);

router.get('/getOrganizers',tokenValidate(),getOrganizerListForEvent);

router
  .route('/:organizerId')
  .get(tokenValidate(), editOrganizer)
  .delete(tokenValidate(), deleteOrganizer)

router
  .route('/')
  .post(tokenValidate(), createOrganizer)
  .get(tokenValidate(), getOrganizer)
  .put(tokenValidate(), updateOrganizer)

module.exports = router
