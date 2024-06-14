const express = require('express')
const router = express.Router()

const {
  userStaffRegister,
  userStaffLogin,
  inviteStaffAndCommitteeMember,
  getAllStaffMember,
  deleteStaffMember,
  blockStaffMember,
  userStaffRegisterLinkExpired,
  getUserStaffProfile,
  updateUserStaffEvent,
  getEventListForStaffAndCommitteeMember,
  acceptEventForCommiteeMember,
  updateUserStaffProfile,
  verifyUserStaffMobileOtp,
  changeUserStaffPassword,
  resendUserStaffMobileOTP,
  sendUserStaffProfileMobileOtp,
  sendUserStaffProfileVerificationEmail,
  userStaffProfileEmailVerification,
  getUserStaffDashboard,
  resendUserStaffEmailOtp,
  getDataBeforeRegister,
  resendInvite,
} = require('../controllers/UserStaffController')

const tokenValidate = require('../middleware/tokencheck')

router.get('/getDataBeforeRegister/:randomString', getDataBeforeRegister)
router.post('/signup', userStaffRegister)
router.post('/signin', userStaffLogin)
router.post('/linkExpired', userStaffRegisterLinkExpired)
router.post('/invite', tokenValidate(), inviteStaffAndCommitteeMember)
router.post('/resendInvite', tokenValidate(), resendInvite)
router.get('/getAllUserStaffMember', tokenValidate(), getAllStaffMember)
router.delete('/delete/:id', tokenValidate(), deleteStaffMember)
router.post('/block', tokenValidate(), blockStaffMember)
router.get('/getUserStaffProfile', tokenValidate(), getUserStaffProfile)
// router.put('/updateEvent', updateUserStaffEvent)
router.get(
  '/getEventList/:userStaffId',
  tokenValidate(),
  getEventListForStaffAndCommitteeMember
)
router.post(
  '/acceptUserStaffEvent/:userStaffId',
  tokenValidate(),
  acceptEventForCommiteeMember
)
router.put(
  '/updateUserStaffProfile/:userStaffId',
  tokenValidate(),
  updateUserStaffProfile
)
router.post('/verifyUserStaffMobileOtp', verifyUserStaffMobileOtp)
router.post(
  '/changeUserStaffPassword',
  tokenValidate(),
  changeUserStaffPassword
)
router.post('/resendMobileOtp', resendUserStaffMobileOTP)
router.post(
  '/sendUserStaffProfileVerificationMobileNumber',
  tokenValidate(),
  sendUserStaffProfileMobileOtp
)
router.post(
  '/sendUserStaffProfileVerificationEmail',
  tokenValidate(),
  sendUserStaffProfileVerificationEmail
)
router.post(
  '/profileVerificationEmail',
  tokenValidate(),
  userStaffProfileEmailVerification
)

router.post('/resendEmailOtp/:userId', resendUserStaffEmailOtp)

router.get('/dashboard', tokenValidate(), getUserStaffDashboard)

router.get('/getDataBeforeRegister/:randomString', getDataBeforeRegister)

module.exports = router
