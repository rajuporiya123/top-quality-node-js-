const MarketingGroup = require('../models/MarketingGroup')
const mongoose = require('mongoose')

module.exports = class MarketingGroupService {
  static async create(data) {
    try {
      const create_marketing_group = await MarketingGroup.create(data)
      return create_marketing_group
    } catch (error) {
      console.log(`Could not add marketing group ${error}`)
      throw error
    }
  }

  static async getMarketingGroup(userId) {
    try {
      const get_marketing_group = await MarketingGroup.aggregate([
        {
          $project: {
            marketingGroupName: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      return get_marketing_group
    } catch (error) {
      console.log(`Could not get marketing email ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let marketing_group_delete_data = await MarketingGroup.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return marketing_group_delete_data
    } catch (error) {
      console.log('Error in deleting marketing group', error)
      throw error
    }
  }

  static async editMarketingGroup(marketingGroupId) {
    try {
      const edit_marketing_group = await MarketingGroup.aggregate([
        {
          $project: {
            _id: 1,
            marketingGroupName: 1,
            userId: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(marketingGroupId),
          },
        },
      ])
      return edit_marketing_group
    } catch (error) {
      console.log(`Could not edit marketing group ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_marketing_group = await MarketingGroup.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_marketing_group
    } catch (error) {
      console.log(`Could not update marketing group ${error}`)
      throw error
    }
  }
}
