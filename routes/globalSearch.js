const express = require('express')
const router = express.Router()

const { globalSearch } = require('../controllers/GlobalSearchController')
const tokenValidate = require('../middleware/tokencheck')

router.get('/', tokenValidate(), globalSearch)

module.exports = router
