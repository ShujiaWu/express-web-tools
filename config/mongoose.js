let mongoose = require('mongoose')
let debug = require('debug')('express-web-tools:mongoose')
const DB_URL = 'mongodb://192.168.36.10:27017/express-web-tools'

mongoose.Promise = global.Promise

// 建立连接
mongoose.connect(DB_URL).then(result => {
  debug(`MongoDB连接成功：${DB_URL}`)
}).catch(error => {
  debug(`MongoDB连接错误：${error}`)
})

// // 连接成功
// mongoose.connection.on('connected', () => {
//   console.log(`MongoDB连接成功：${DB_URL}`)
// })

// // 连接异常
// mongoose.connection.on('error', (error) => {
//   console.log(`MongoDB连接错误：${error}`)
// })

// 断开连接
mongoose.connection.on('disconnected', () => {
  debug(`MongoDB断开连接：${DB_URL}`)
})

module.exports = mongoose