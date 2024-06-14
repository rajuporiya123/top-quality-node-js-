const mongoose = require('mongoose')

let videoQualitySchema = new mongoose.Schema(
  {
    quality: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('VideoQuality', videoQualitySchema)
