const mongoose = require('mongoose')
const Organization = require('../models/Organization')
const Organizer = require('../models/Organizer')

module.exports = class OrganizationService {
  static async create(data) {
    try {
      const create_organization = await Organization.create(data)
      return create_organization
    } catch (error) {
      console.log(`Could not add organization ${error}`)
      throw error
    }
  }

  static async getOrganization(userId, organizationLogo) {
    try {
      if(organizationLogo === "") {
        const get_organization = await Organization.aggregate([
          {
            $project: {
              organizationName: 1,
              prefferedCountry: 1,
              userId: 1,
            },
          },
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
            },
          },
        ])
        return get_organization
      } else {
        const get_organization = await Organization.aggregate([
          {
            $project: {
              organizationName: 1,
              prefferedCountry: 1,
              userId: 1,
              organizationLogo: {
                $concat: [process.env.ORGANIZATION_LOGO, '$organizationLogo'],
              },
            },
          },
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
            },
          },
        ])
        return get_organization
      }
    } catch (error) {
      console.log(`Could not get organization ${error}`)
      throw error
    }
  }

  static async editOrganization(organizationId) {
    try {
      const get_organization = await Organization.aggregate([
        {
          $project: {
            organizationName: 1,
            prefferedCountry: 1,
            userId: 1,
            organizationLogo: {
              $concat: [process.env.ORGANIZATION_LOGO, '$organizationLogo'],
            },
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(organizationId),
          },
        },
      ])
      return get_organization
    } catch (error) {
      console.log(`Could not edit organization ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      let update_organization_data = await Organization.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_organization_data
    } catch (error) {
      console.log('Error in update organization', error)
      throw error
    }
  }

  static async destory(id) {
    try {
      let organization_delete_data = await Organization.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })
      let organizer = await Organizer.find()
      if(organizer.length > 0) {
        await Organizer.deleteMany({
          organizationId: mongoose.Types.ObjectId(id),
        })
        return organization_delete_data
      }
      return organization_delete_data
    } catch (error) {
      console.log('Error in organization deleting', error)
      throw error
    }
  }
}
