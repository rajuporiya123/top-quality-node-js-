const RolesAndPermissionService = require('../services/RolesAndPermissionsService')
const { Validator } = require('node-input-validator')
const { statuscode } = require('../config/codeAndMessage')
const UserStaff = require('../models/UserStaff')
const RolesAndPermissions = require('../models/RolesAndPermissions')

exports.createRolesAndPermissions = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      role_name: 'required',
      permissions: 'required',
    })

    const matched = await v.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: v.errors,
      })
    }

    let role_and_permissions_data = {
      roleName: req.body.role_name,
      permissions: req.body.permissions,
      userId: req.user.id,
      eventId: req.body.eventId,
      userType: req.body.user_type,
      userStaffEmail: req.body.user_staff_email,
    }

    const save_roles_and_permissions = await RolesAndPermissionService.create(
      role_and_permissions_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Roles And Permissions Created Successfully',
      data: save_roles_and_permissions,
    })
  } catch (err) {
    console.log('error', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.getAllRolesAndPermissions = async (req, res) => {
  try {
    let get_roles_and_permissions =
      await RolesAndPermissionService.getRolesAndPermissions(req.user.id)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: get_roles_and_permissions,
      message: 'Data retrived successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.editRolesAndPermissions = async (req, res) => {
  try {
    const edit_roles_and_permissions =
      await RolesAndPermissionService.editRolesAndPermissions(
        req.query.eventId,
        req.query.userStaffId
      )
    // const edit_roles_and_permissions = await RolesAndPermissions.findOne({userId:req.user.id,eventId:req.query.eventId})
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: edit_roles_and_permissions[0],
      message: 'Data retrived successfully',
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}

exports.updateRolesAndPermissions = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      permissions: 'required',
    })

    const matched = await v.check()
    if (!matched) {
      return res.status(400).json({
        data: [],
        statusCode: statuscode.bad_request,
        success: false,
        message: v.errors,
      })
    }

    let role_and_permissions_data = {
      permissions: req.body.permissions,
      userId: req.user.id,
      eventId: req.body.eventId,
      userType: req.body.user_type,
      userStaffEmail: req.body.user_staff_email,
    }
    await UserStaff.findOneAndUpdate(
      {
        email: req.body.user_staff_email,
        'eventData.eventId': req.body.oldEventId,
      },
      {
        $set: {
          'eventData.$.permission': req.body.permissions,
          'eventData.$.eventId': req.body.eventId,
        },
      },
      { new: true }
    )
    const update_roles_and_permissions = await RolesAndPermissionService.update(
      req.body.permissionId,
      role_and_permissions_data
    )
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      message: 'Roles And Permissions Updated Successfully',
      data: update_roles_and_permissions,
    })
  } catch (err) {
    console.log('error', err)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: err,
    })
  }
}

exports.deleteRolesAndPermissions = async (req, res) => {
  try {
    const delete_roles_and_permissions =
      await RolesAndPermissionService.destory(req.params.permissionId)
    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: delete_roles_and_permissions,
      message: 'Roles And Permissions deleted successfully',
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: err,
      data: [],
    })
  }
}
