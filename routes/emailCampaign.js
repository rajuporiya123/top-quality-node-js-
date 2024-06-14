const express = require('express')
const router = express.Router()

const {
  createEmailCampaign,
  getAllEmailCampaign,
  editEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
} = require('../controllers/EmailCampaignController')

const tokenValidate = require('../middleware/tokencheck')

router
  .route('/')
  .post(tokenValidate(), createEmailCampaign)
  .get(tokenValidate(), getAllEmailCampaign)
  .put(tokenValidate(), updateEmailCampaign)

router
  .route('/:emailCampaignId')
  .get(tokenValidate(), editEmailCampaign)
  .delete(tokenValidate(), deleteEmailCampaign)

module.exports = router
