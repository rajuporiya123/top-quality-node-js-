const express = require('express')
const router = express.Router()

const {
  createCoupon,
  getAllCoupons,
  editCoupon,
  updateCoupon,
  deleteCoupon,
  getTicketsAndAddons,
} = require('../controllers/CouponController')
const tokenValidate = require('../middleware/tokencheck')

router.get('/getTicketsAddons', tokenValidate(), getTicketsAndAddons)

router
  .route('/')
  .post(tokenValidate(), createCoupon)
  .get(tokenValidate(), getAllCoupons)
  .put(tokenValidate(), updateCoupon)

router
  .route('/:couponId')
  .get(tokenValidate(), editCoupon)
  .delete(tokenValidate(), deleteCoupon)

module.exports = router
