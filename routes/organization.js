const express = require('express')
const router = express.Router()

const {
  createOrganization,
  getOrganization,
  updateOrganization,
  editOrganization,
  deleteOrganization,
  removeOrganizationLogo,
} = require('../controllers/OrganizationController')

const tokenValidate = require('../middleware/tokencheck')

router.post('/remove/organizationLogo', tokenValidate(), removeOrganizationLogo)

router
  .route('/:organizationId')
  .get(tokenValidate(), editOrganization)
  .delete(tokenValidate(), deleteOrganization)

router
  .route('/')
  .post(tokenValidate(), createOrganization)
  .get(tokenValidate(), getOrganization)
  .put(tokenValidate(), updateOrganization)

module.exports = router
