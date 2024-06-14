var jwt = require('jsonwebtoken')
const { statuscode } = require('../config/codeAndMessage')
const UserStaff = require('../models/UserStaff')

module.exports = function () {
  return async function (req, res, next) {
    try {
      if (
        req.headers.authorization == undefined ||
        req.headers.authorization == 'undefined'
      ) {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          data: [],
          message: 'Please Enter Token',
        })
      }

      var decoded = jwt.verify(
        req.headers.authorization,
        process.env.JWT_SECRET
      )
      // console.log(decoded)
      req.user = decoded
      const user = await UserStaff.findById(req.user.id)
      if(user?.isBlockedByManager)
      {
        return res.status(400).json({
          success: false,
          statusCode: statuscode.bad_request,
          data: [],
          message: 'Your account is blocked',
        })
      }
      next()
    } catch (error) {
      console.log('<<<<<Token Invalid Error<<<<<', error)
      return res.status(400).json({
        success: false,
        statusCode: statuscode.bad_request,
        data: [],
        message: 'Token is not valid',
      })
    }
  }
}
