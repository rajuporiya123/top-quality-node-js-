const mongoose = require('mongoose')

let videoLibraryFileSchema = new mongoose.Schema(
  {
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Language',
    },
    genres: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    videoUploadType: {
      type: String,
      default: '',
    },
    videoQuality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoQuality',
    },
    videoFile: {
      type: String,
      default: '',
    },
    download: {
      type: String,
      enum: ['Allow', 'Do Not Allow'],
    },
    downloadUrl: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      enum: ['Active', 'Inactive'],
    },
    subTitleUrl: [
      {
        language: String,
        url: String,
      },
    ],
    videoLibraryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoLibrary',
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('VideoLibraryFile', videoLibraryFileSchema)
