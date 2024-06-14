const Subscriber = require('../models/Subscriber')
const mongoose = require('mongoose')

module.exports = class SubscriberService {
  static async create(data) {
    try {
      const create_subscriber = await Subscriber.create(data)
      return create_subscriber
    } catch (error) {
      console.log(`Could not add subscriber ${error}`)
      throw error
    }
  }

  static async getSubscriber(marketingGroupId) {
    try {
      const get_subscriber = await Subscriber.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            countryCode: 1,
            mobileNumber: 1,
            userId: 1,
            marketingGroupId: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            marketingGroupId: mongoose.Types.ObjectId(marketingGroupId),
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      return get_subscriber
    } catch (error) {
      console.log(`Could not get subscriber ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let subscriber_delete_data = await Subscriber.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return subscriber_delete_data
    } catch (error) {
      console.log('Error in deleting subscriber', error)
      throw error
    }
  }

  static async editSubscriber(subscriberId) {
    try {
      const edit_subscriber = await Subscriber.aggregate([
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            countryCode: 1,
            mobileNumber: 1,
            userId: 1,
            marketingGroupId: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(subscriberId),
          },
        },
      ])
      return edit_subscriber
    } catch (error) {
      console.log(`Could not edit subscriber ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_subscriber = await Subscriber.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_subscriber
    } catch (error) {
      console.log(`Could not update subscriber ${error}`)
      throw error
    }
  }
}
