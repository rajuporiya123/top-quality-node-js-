const express = require('express')
const router = express.Router()

const {
  createAddon,
  getAllAddons,
  editAddon,
  updateAddon,
  deleteAddon,
  deleteVariation,
  editVariation,
  updateVariation,
  getAddonOption,
} = require('../controllers/AddonController')
const tokenValidate = require('../middleware/tokencheck')

router.get('/addonOption/:eventId', tokenValidate(), getAddonOption)

router
  .route('/variation')
  .delete(tokenValidate(), deleteVariation)
  .get(tokenValidate(), editVariation)
  .put(tokenValidate(), updateVariation)

router
  .route('/')
  .post(tokenValidate(), createAddon)
  .get(tokenValidate(), getAllAddons)
  .put(tokenValidate(), updateAddon)

router
  .route('/:addonId')
  .get(tokenValidate(), editAddon)
  .delete(tokenValidate(), deleteAddon)

module.exports = router
