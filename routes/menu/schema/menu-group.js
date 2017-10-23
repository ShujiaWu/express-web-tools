let mongoose = require('../../../config/mongoose.js')
let Schema = mongoose.Schema

let MenuGroupSchema = new Schema({
  name: {
    type: String
  },
  icon: {
    type: String
  }
})

module.exports = mongoose.model('MenuGroup', MenuGroupSchema)
