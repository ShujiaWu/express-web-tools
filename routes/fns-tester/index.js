let express = require('express')
let router = express.Router()

let redis = require('./redis/index')

router.use('/redis', redis)


module.exports = router