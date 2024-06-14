const express = require('express')
const router = express.Router()

const {
  createRolesAndPermissions,
  getAllRolesAndPermissions,
  editRolesAndPermissions,
  updateRolesAndPermissions,
  deleteRolesAndPermissions,
} = require('../controllers/RolesAndPermissionsController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/edit', tokenValidate(), editRolesAndPermissions)
router.delete('/:permissionId', tokenValidate(), deleteRolesAndPermissions)

router
  .route('/')
  .post(tokenValidate(), createRolesAndPermissions)
  .get(tokenValidate(), getAllRolesAndPermissions)
  .put(tokenValidate(), updateRolesAndPermissions)

module.exports = router
