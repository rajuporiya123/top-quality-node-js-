const TextMessageGroup = require('../models/TextMessageGroup')
const Event = require('../models/Event')
const mongoose = require('mongoose')

module.exports = class TextMessageGroupService {
  static async create(data) {
    try {
      const create_text_message_group = await TextMessageGroup.create(data)
      return create_text_message_group
    } catch (error) {
      console.log(`Could not add text message group ${error}`)
      throw error
    }
  }

  static async getTextMessageGroup(userId) {
    try {
      const get_text_message_group = await TextMessageGroup.aggregate([
        {
          $project: {
            groupName: 1,
            phoneNumber: 1,
            userId: 1,
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
      ])
      return get_text_message_group
    } catch (error) {
      console.log(`Could not get subscriber ${error}`)
      throw error
    }
  }

  static async destroy(id) {
    try {
      let text_message_group_delete_data = await TextMessageGroup.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return text_message_group_delete_data
    } catch (error) {
      console.log('Error in deleting text message group', error)
      throw error
    }
  }

  static async getAllEventForTextMessageGroup(userId) {
    try {
      const get_text_message_group = await Event.aggregate([
        {
          $project: {
            userId: 1,
            eventTitle: 1,
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
          },
        },
      ])
      return get_text_message_group
    } catch (error) {
      console.log(`Could not get subscriber ${error}`)
      throw error
    }
  }

  static async getSingleTextMessageGroup(groupId) {
    try {
      const get_single_text_message_group = await TextMessageGroup.aggregate([
        {
          $project: {
            _id: 1,
            groupName: 1,
            phoneNumber: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(groupId),
          },
        },
      ])
      return get_single_text_message_group
    } catch (error) {
      console.log(`Could not get single text message group details ${error}`)
      throw error
    }
  }

  static async editTextMessageGroup(messageGroupId) {
    try {
      const edit_text_message_group = await TextMessageGroup.aggregate([
        {
          $project: {
            _id: 1,
            groupName: 1,
            phoneNumber: 1,
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(messageGroupId),
          },
        },
      ])
      return edit_text_message_group
    } catch (error) {
      console.log(`Could not get single text message group details ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      const update_text_message_group = await TextMessageGroup.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_text_message_group
    } catch (error) {
      console.log(`Could not update text message group ${error}`)
      throw error
    }
  }
}
