const express = require('express')
const router = express.Router()

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getUserProfile,
  loginWithGoogle,
  loginWithFacebook,
  verifyEmail,
  verifyMobileOtp,
  resendMobileOTP,
  getSingleUser,
  resendConfirmationEmail,
  checkEmailVerify,
  profileEmailVerification,
  sendProfileVerificationEmail,
  sendProfileMobileOtp,
  verifyProfileMobileOtp,
  getEventManagerData,
  resetPasswordLinkExpired,
} = require('../controllers/UserController')

const tokenValidate = require('../middleware/tokencheck')

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword', resetPassword)
router.get('/getSingleUser/:userId', getSingleUser)
router.post('/resendEmail/:userId', resendConfirmationEmail)
router.get('/checkEmailVerify/:userId', checkEmailVerify)
router.post('/changePassword', tokenValidate(), changePassword)
router.put('/updateProfile', tokenValidate(), updateProfile)
router.get('/getUserProfile', tokenValidate(), getUserProfile)
router.post('/google/login', loginWithGoogle)
router.get('/facebook/login', loginWithFacebook)
router.post('/verifyEmail/:randomstring', verifyEmail)
router.post('/verifyMobileOtp', verifyMobileOtp)
router.post('/resendMobileOtp', resendMobileOTP)
router.post(
  '/profileEmailVerification',
  tokenValidate(),
  profileEmailVerification
)
router.post(
  '/sendProfileVerificationEmail',
  tokenValidate(),
  sendProfileVerificationEmail
)
router.post(
  '/sendProfileVerificationMobileNumber',
  tokenValidate(),
  sendProfileMobileOtp
)
router.post('/verifyProfileMobileOtp', tokenValidate(), verifyProfileMobileOtp)
router.get('/resetPasswordLinkExpired/:randomString', resetPasswordLinkExpired)
// router.post("/resetPasswordLinkExpired", resetPasswordLinkExpired);

module.exports = router
