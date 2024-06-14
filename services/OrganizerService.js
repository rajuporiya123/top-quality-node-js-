const mongoose = require('mongoose')
const Organizer = require('../models/Organizer')

module.exports = class OrganizerService {
  static async create(data) {
    try {
      const create_organizer = await Organizer.create(data)
      return create_organizer
    } catch (error) {
      console.log(`Could not add organizer ${error}`)
      throw error
    }
  }

  static async getOrganizer(userId, globalSearch) {
    try {
      const regex = new RegExp(globalSearch, 'i')

      let matchObj
      if (globalSearch) {
        matchObj = {
          userId: mongoose.Types.ObjectId(userId),
          organizerName: regex,
        }
      } else {
        matchObj = {
          userId: mongoose.Types.ObjectId(userId),
        }
      }

      const get_organizer = await Organizer.aggregate([
        {
          $project: {
            organizerName: 1,
            website: 1,
            userId: 1,
            organizerBio: 1,
            description: 1,
            facebookId: 1,
            twitterId: 1,
            emailOption: 1,
            organizationId: 1,
            organizerProfileImage: {
              $cond: {
                if: { $eq: ['$organizerProfileImage', ''] },
                then: '',
                else: {
                  $concat: [
                    process.env.ORGANIZER_LOGO,
                    '$organizerProfileImage',
                  ],
                },
              },
            },
          },
        },
        {
          $match: matchObj,
        },
      ])
      return get_organizer
    } catch (error) {
      console.log(`Could not get organizer ${error}`)
      throw error
    }
  }

  static async editOrganizer(organizerId, organizerProfileImage) {
    try {
      if (organizerProfileImage === '') {
        const edit_organizer = await Organizer.aggregate([
          {
            $project: {
              organizerName: 1,
              website: 1,
              userId: 1,
              organizerBio: 1,
              description: 1,
              facebookId: 1,
              twitterId: 1,
              emailOption: 1,
              organizationId: 1,
              organizerProfileImage: 1,
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(organizerId),
            },
          },
        ])
        return edit_organizer
      } else {
        const edit_organizer = await Organizer.aggregate([
          {
            $project: {
              organizerName: 1,
              website: 1,
              userId: 1,
              organizerBio: 1,
              description: 1,
              facebookId: 1,
              twitterId: 1,
              emailOption: 1,
              organizationId: 1,
              organizerProfileImage: {
                $concat: [process.env.ORGANIZER_LOGO, '$organizerProfileImage'],
              },
            },
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(organizerId),
            },
          },
        ])
        return edit_organizer
      }
    } catch (error) {
      console.log(`Could not edit organizer ${error}`)
      throw error
    }
  }

  static async update(update_data) {
    try {
      let update_organizer_data = await Organizer.updateOne(
        { _id: mongoose.Types.ObjectId(update_data._id) },
        update_data
      )
      return update_organizer_data
    } catch (error) {
      console.log('Error in update organizer', error)
      throw error
    }
  }

  static async destory(id) {
    try {
      let organizer_delete_data = await Organizer.deleteOne({
        _id: mongoose.Types.ObjectId(id),
      })

      return organizer_delete_data
    } catch (error) {
      console.log('Error in organizer deleting', error)
      throw error
    }
  }
}
