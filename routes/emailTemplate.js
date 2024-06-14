const express = require('express')
const router = express.Router()

const {
  createEmailTemplate,
  getAllEmailTemplate,
  deleteEmailTemplate,
  editEmailTemplate,
  updateEmailTemplate,
  getEmailTemplate,
} = require('../controllers/EmailTemplateController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/emailTemplateList', tokenValidate(), getEmailTemplate)

router
  .route('/')
  .post(tokenValidate(), createEmailTemplate)
  .get(tokenValidate(), getAllEmailTemplate)
  .put(tokenValidate(), updateEmailTemplate)

router
  .route('/:templateId')
  .get(tokenValidate(), editEmailTemplate)
  .delete(tokenValidate(), deleteEmailTemplate)

module.exports = router
