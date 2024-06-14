const express = require('express')
const router = express.Router()

const {
  createMarketingGroup,
  getAllMarketingGroup,
  editMarketingGroup,
  updateMarketingGroup,
  deleteMarketingGroup,
  getMarketingGroup,
} = require('../controllers/MarketingGroupController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/marketingGroupList', tokenValidate(), getMarketingGroup)

router
  .route('/')
  .post(tokenValidate(), createMarketingGroup)
  .get(tokenValidate(), getAllMarketingGroup)
  .put(tokenValidate(), updateMarketingGroup)

router
  .route('/:marketingGroupId')
  .get(tokenValidate(), editMarketingGroup)
  .delete(tokenValidate(), deleteMarketingGroup)

module.exports = router
