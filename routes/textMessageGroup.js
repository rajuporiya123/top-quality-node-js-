const express = require('express')
const router = express.Router()

const {
  createTextMessageGroup,
  getAllTextMessageGroup,
  deleteTextMessageGroup,
  sendTextMessage,
  getAllEventForTextMessageGroup,
  getSingleTextMessageGroup,
  editTextMessageGroup,
  updateTextMessageGroup,
} = require('../controllers/TextMessageGroupController')

const tokenValidate = require('../middleware/tokencheck')

router.post('/send/textMessage', tokenValidate(), sendTextMessage)
router.get(
  '/eventForTextMesssageGroup',
  tokenValidate(),
  getAllEventForTextMessageGroup
)
router.get(
  '/singleTextMesssageGroup/:groupId',
  tokenValidate(),
  getSingleTextMessageGroup
)

router
  .route('/:messageGroupId')
  .get(tokenValidate(), editTextMessageGroup)
  .delete(tokenValidate(), deleteTextMessageGroup)

router
  .route('/')
  .post(tokenValidate(), createTextMessageGroup)
  .get(tokenValidate(), getAllTextMessageGroup)
  .put(tokenValidate(), updateTextMessageGroup)

module.exports = router
