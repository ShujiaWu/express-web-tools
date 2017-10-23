let mongoose = require('../../../config/mongoose.js')
let Schema = mongoose.Schema

let MenuSchema = new Schema({
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'Menu'
  },
  name: {
    type: String
  },
  icon: {
    type: String
  },
  target: {
    type: Object
  }
})

module.exports = mongoose.model('Menu', MenuSchema)
