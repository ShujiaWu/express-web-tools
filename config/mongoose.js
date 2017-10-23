let mongoose = require('mongoose')

const DB_URL = 'mongodb://192.168.204.130:27017/express-web-tools'

mongoose.Promise = global.Promise

// 建立连接
mongoose.connect(DB_URL).then(result => {
  console.log(`MongoDB连接成功：${DB_URL}`)
}).catch(error => {
  console.log(`MongoDB连接错误：${error}`)
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
  console.log(`MongoDB断开连接：${DB_URL}`)
})

module.exports = mongoose