let express = require('express')
let datetime = require('../../utils/datetime')
let router = express.Router()
let mysql = require('../../config/mysql')
let Response = require('../../config/Response')
let io = require('socket.io')(11080)
const PageConfig = require('../../config/page')
let redis = require('../../config/redis')
let debug = require('debug')('express-web-tools:monitor')

let monitor = io.of('/monitor')

//================================================================
// TODO: 以后使用redis处理，先这么用着
//================================================================
//#region
// APP ID
// let appIDs = []
// // 查询数据库中的APP ID
// mysql.query('select distinct appID from console_msg', null, (err, results, fields) => {
//   if (err) {
//     console.log(err)
//     return
//   }
//   results.forEach(element => {
//     if (appIDs.indexOf(element.appID) === -1) {
//       appIDs.push(element.appID)
//     }
//   }, this)
// })
// 查找数据库中的ClientID
let clientIDs = {}

Promise.all([
  // 删除 App ID
  new Promise((resolve, reject) => {
    redis.del('MonitorAppID', (err) => {
      if (err) {
        reject(err)
      }
      debug(`清理APP ID数据成功`)
      resolve(true)
    })
  }),
  // 删除所有的 Client ID
  new Promise((resolve, reject) => {
    redis.keys('MonitorClientID:*', (err, result) => {
      if (err) {
        reject(err)
      }
      if (result.length === 0) {
        debug('暂无Client ID数据')
        resolve(true)
      }
      redis.del(result, (err, result) => {
        if (err) {
          reject(err)
          return
        }
        debug(`清理Client ID数据成功`)
        resolve(true)
      })
    })
  })
]).then(results => {
  return new Promise((resolve, reject) => {
    mysql.query('select distinct appID, clientID from console_msg', null, (err, results, fields) => {
      if (err) {
        reject(err)
      }
      results.forEach(element => {
        redis.sadd('MonitorAppID', element.appID)
        redis.sadd(`MonitorClientID:${element.appID}`, element.clientID)
      }, this)
      resolve(true)
    })
  })
}).catch (e => {
  debug(e)
})


//#endregion
//================================================================

monitor.on('connection', (socket) => {
  socket.on('appID', (data) => {
    // 离开所有的房间
    socket.leaveAll()
    // 加入到指定的房间
    socket.join(data)
    console.log(`${socket.id}加入房间${data}`)
  })
  // 用户建立连接，自动进入房间ALL
  socket.join('ALL')
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
  let data = req.body
  if (typeof req.body === 'string') {
    data = JSON.parse(req.body)
  }
  // 写入数据库
  let options = []
  data.data.forEach((element) => {
    options.push([
      data.appID, element.level, data.clientID, 
      new Date(element.datetime), element.path, element.browser, 
      typeof element.msg === 'object'? JSON.stringify(element.msg) : element.msg])
  }, this)
  mysql.query('insert into console_msg(appID, level, clientID, datetime, path, browser, msg) values ?' , [options], (err, results, fields) => {
    if (err) {
      // console.log('=============================')
      // console.log('插入数据失败')
      // console.log(err)
      // console.log('=============================')
      console.log(err)
      res.sendStatus(400, err)
    } else {
      console.log('插入数据成功')
      res.json(Response.success())
    }
  })
  // 信息推送
  data.data.forEach((element) => {
    element.clientID = data.clientID
    element.appID = data.appID
    // console.log('===================')
    // console.log(`信息级别：${element.level}`)
    // console.log(`信息时间：${datetime(element.datetime, 'yyyy-MM-dd HH:mm:ss')}`)
    // console.log(`信息路径：${element.path}`)
    // console.log(typeof element.msg)
    // switch (typeof element.msg) {
    // case 'string':
    //   console.log(`信息内容：${element.msg}`) 
    //   break
    // case 'object':
    //   console.log(`信息内容：${JSON.stringify(element.msg)}`)
    // }
    // console.log(`浏览器信息：${element.browser}`)
    
    // 将消息推送至UNKNOW房间
    monitor.to('ALL').emit('new-msg', element)
    // 将数据推送到appID所在的房间
    monitor.to(data.appID).emit('new-msg', element)
  }, this)


  // 推送新APP ID
  // if (appIDs.indexOf(data.appID) === -1) {
  //   appIDs.push(data.appID)
  //   monitor.emit('new-app', data.appID)
  // }
  redis.sadd('MonitorAppID', [data.appID], (err, result) => {
    if (err) {
      debug('【redis】存储APP ID失败')
    } else {
      if (result === 0) {
        // 已经存在在集合中
      } else {
        // 不存在在集合中， 推送到客户端
        monitor.emit('new-app', data.appID)
      }
      debug(`【redis】存储APP ID成功${result}`)
    }
  })
  redis.sadd(`MonitorClientID:${data.appID}`, [data.clientID], (err, result) => {
    if (err) {
      debug('【redis】存储Client ID失败')
    } else {
      if (result === 0) {
        // 已经存在在集合中
      } else {
        // 不存在在集合中， 推送到客户端
        // 推送新的Client ID加入
        monitor.emit('new-client', {
          appID: data.appID,
          clientID: data.clientID
        })
      }
      debug(`【redis】存储Client ID成功${result}`)
    }
  })

  // 推送
  // if (!clientIDs[data.appID]) {
  //   clientIDs[data.appID] = []
  //   // 推送新的 APP ID 加入
  //   monitor.emit('new-app', data.appID)
  //   clientIDs[data.appID].push(data.clientID)
  //   // 推送新的Client ID加入
  //   monitor.emit('new-client', {
  //     appID: data.appID,
  //     clientID: data.clientID
  //   })
  // } else {
  //   if (clientIDs[data.appID].indexOf(data.clientID) === -1) {
  //     // 推送新的Client ID加入
  //     clientIDs[data.appID].push(data.clientID)
  //     monitor.emit('new-client', {
  //       appID: data.appID,
  //       clientID: data.clientID
  //     })
  //   }
  // }
})

/**
 * 获取所有的 App ID
 */
router.get('/appid', function (req, res, next) {
  redis.smembers('MonitorAppID', (err, result) => {
    if (err) {
      next(err)
      return
    }
    res.json(Response.success({
      result
    }))
  })
  // let result = []
  // for (var key in clientIDs) {
  //   if (clientIDs.hasOwnProperty(key)) {
  //     result.push(key)
  //   }
  // }
  // res.json(Response.success({result}))
})

/**
 * 获取所有的 Client ID
 */
router.get('/client-id', function (req, res, next) {
  let data = {}
  redis.smembers('MonitorAppID', (err, result) => {
    if (err) {
      next(err)
      return
    }
    let multi = redis.multi()
    result.forEach((element) => {
      multi = multi.smembers(`MonitorClientID:${element}`, (err, result) => {
        data[element] = result
      })
    }, this)
    multi.exec((err, results) => {
      if (err) {
        next(err)
        return
      }
      res.json(Response.success({result: data}))
    })
  })

})

// 获取信息
router.get('/message', function(req, res, next) {
  let options = []

  let level = '1 = 1'
  if (req.query['level'] && req.query['level'].length) {
    level = 'level in (?)'
    options.push(req.query['level'])
  }

  let appID = '1 = 1'
  if (req.query['appID']) {
    appID = 'appID = ?'
    options.push(req.query['appID'])
  }

  let clientID = '1 = 1'
  if (req.query['clientID']) {
    clientID = 'clientID = ?'
    options.push(req.query['clientID'])
  }

  let size = parseInt(req.query['size'] || PageConfig.size)
  let current = parseInt(req.query['current']) || 1
  let offet = size * (current - 1)
  options.push(offet)
  options.push(size)

  Promise.all([
    new Promise ((resolve,reject) => {
      mysql.query(`select count(*) as size from console_msg where ${level} and ${appID} and ${clientID}`, options, (err, results, fields) => {
        if (err) {
         reject(err)
        }
        resolve(results[0].size)
      })
    }),
    new Promise ((resolve,reject) => {
      mysql.query(`select * from console_msg where ${level} and ${appID} and ${clientID} order by id desc limit ?,?`, options, (err, results, fields) => {
        if (err) {
         reject(err)
        }
        resolve(results)
      })
    })
  ]).then(result => {
    res.json(Response.success({
      result: {
        page: {
          size: size,
          total: result[0],
          current: current
        },
        list: result[1]
      }
    }))
  }).catch(e => {
    next(e)
  })
})

router.get('/test', function(req, res) {
  console.log(monitor.rooms)
  res.json(Response.success())
})

module.exports = router