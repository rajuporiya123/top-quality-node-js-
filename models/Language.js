const mongoose = require('mongoose')

let languageSchema = new mongoose.Schema(
  {
    languageName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Language', languageSchema)
