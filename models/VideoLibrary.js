const mongoose = require('mongoose')

let videoLibrarySchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    defaultLanguage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Language',
    },
    movieAccess: {
      type: String,
      enum: ['Free', 'Paid'],
    },
    actors: [
      {
        type: String,
      },
    ],
    directors: [
      {
        type: String,
      },
    ],
    imdbRating: {
      type: Number,
    },
    contentRating: {
      type: Number,
    },
    releaseDate: {
      type: Date,
    },
    duration: {
      type: String,
      default: '',
    },
    status: {
      type: Boolean,
      default: false,
    },
    movieThumbnail: {
      type: String,
      default: '',
    },
    moviePoster: {
      type: String,
      default: '',
    },
    seoTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    keywords: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('VideoLibrary', videoLibrarySchema)
