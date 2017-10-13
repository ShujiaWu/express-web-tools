let express = require('express')
let datetime = require('../utils/datetime')
let router = express.Router()

let io = require('socket.io')(80)

let monitor = io.of('/monitor')

monitor.on('connection', () => {
  console.log('连接建立')
})

router.all('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

router.post('/', function (req, res) {
  // console.log(req.body)
  console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
  req.body.data.forEach((element) => {
    console.log('===================')
    console.log(`信息级别：${element.level}`)
    console.log(`信息时间：${datetime(element.datetime, 'yyyy-MM-dd HH:mm:ss')}`)
    console.log(`信息路径：${element.path}`)
    console.log(typeof element.msg)
    switch (typeof element.msg) {
    case 'string':
      console.log(`信息内容：${element.msg}`) 
      break
    case 'object':
      console.log(`信息内容：${JSON.stringify(element.msg)}`)
    }
    console.log(`浏览器信息：${element.browser}`)
    monitor.emit('monitor', element)
  }, this)

  res.json({
    success: true
  })
})

module.exports = router