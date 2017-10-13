var express = require('express')
var router = express.Router()

router.all('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

router.get('/', function (req, res) {
  res.send('respond with a resource')
})

router.post('/', function (req, res) {
  res.send('respond with a resource')
})

module.exports = router
