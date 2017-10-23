var express = require('express')
var router = express.Router()
// const Menu = require('./schema/menu')
// let initData = require('./data/init')
let mysql = require('../../config/mysql')

const PageConfig = {
  size: 10,
  now: 1
}

// router.all('/', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

/**
 * 初始化数据
 */
// router.post('/init', (req, res) => {
//   let errorMsg = []
//   initData.forEach((element) => {
//     let menu = Menu(element)
//     menu.save((err, res) => {
//       if (err) {
//         // 异常
//         errorMsg.push(err.message)
//       } else {
//         element.menus.forEach((menu) => {
//           menu.parent = res._id
//           let subMenu = Menu(menu)
//           subMenu.save((err) => {
//             if (err) {
//               // 异常
//               errorMsg.push(err.message)
//             }
//           })
//         })
//       }
//     })
//   }, this)
//   if (errorMsg.length === 0) {
//     res.json({
//       code: 'SUCCESS',
//       message: '初始化数据成功',
//     })
//   } else {
//     res.json({
//       code: 'Error',
//       message: errorMsg.join(','),
//     })
//   }
// })

router.get('/', function (req, res, next) {
  mysql.query(`
  SELECT
    g.id AS gId,
    g.name AS gName,
    g.icon AS gIcon,
    m.id,
    m.name,
    m.icon,
    m.target 
  FROM
    ( SELECT id, name, icon, parent, target, seq FROM menus WHERE is_deleted = 0 AND enabled = 1 ) AS g
    JOIN ( SELECT id, name, icon, parent, target, seq FROM menus WHERE is_deleted = 0 AND enabled = 1 ) AS m ON g.id = m.parent 
  ORDER BY
    g.seq DESC,
    m.seq DESC
  `, null, (err, results, fields) => {
    if (err) {
      next(err)
      return
    }
    let data = []
    if (results && results.length) {
      let groups = {}
      console.log(results)
      results.forEach(element => {
        // if (!element.parent) {
        //   // 菜单组
        //   groups[element.id] = {
        //     id: element.id,
        //     icon: element.icon,
        //     name: element.name,
        //     menus: []
        //   }
        //   data.push(groups[element.id])
        // } else {
        //   // 菜单
        //   groups[element.parent].menus.push({
        //     id: element.id,
        //     icon: element.icon,
        //     name: element.name,
        //     target: JSON.parse(element.target)
        //   })
        // }
        if (!groups[element.gId]) {
          groups[element.gId] = {
            id: element.gId,
            icon: element.gIcon,
            name: element.gName,
            menus: []
          }
          data.push(groups[element.gId])
        }
        groups[element.gId].menus.push({
          id: element.id,
          icon: element.icon,
          name: element.name,
          target: JSON.parse(element.target)
        })
      }, this)
    }
    res.json({
      code: 'SUCCESS',
      message: '获取数据成功',
      result: data
    })
  })
  // console.log('++++++++')
  // let data = []
  // Menu.find({    
  // }, {
  //   __v: 0
  // }).exec((err,res) => {
  //   if (err) {
  //     next(err)
  //   }
  //   if (res && res.length) {
  //     let groups = {}
  //     res.forEach(element => {
  //       if (!element.parent) {
  //         // 菜单组
  //         groups[element._id] = {
  //           id: element.id,
  //           icon: element.icon,
  //           name: element.name,
  //           menus: []
  //         }
  //         data.push(groups[element._id])
  //       } else {
  //         // 菜单
  //         groups[element.parent].menus.push({
  //           id: element.id,
  //           icon: element.icon,
  //           name: element.name,
  //           target: element.target
  //         })
  //       }
  //     }, this)
  //     resp.json({
  //       code: 'SUCCESS',
  //       message: '获取数据成功',
  //       result: data
  //     })
  //   }
  // })

})

// router.get('/group', function (req, resp, next) {
//   let list = []
//   let page = {}
//   Object.assign(page, PageConfig, {
//     now: parseInt(req.query['pageNow']),
//     size: parseInt(req.query['pageSize'])
//   })
//   Promise.all([
//     new Promise((resolve) => {
//       Menu.count((err, res) => {
//         resolve(res)
//       })
//     }),
//     new Promise((resolve) => {
//       Menu
//         .find({
//           parent: undefined
//         }, {
//           __v: 0
//         })
//         .skip(page.size * (page.now - 1))
//         .limit(page.size)
//         .exec((err, res) => {
//           if (err) {
//             next(err)
//           }
//           if (res && res.length) {
//             res.forEach(element => {
//               list.push({
//                 id: element.id,
//                 icon: element.icon,
//                 name: element.name
//               })
//             }, this)
//             resolve(list)
//           }
//         })
//     })
//   ]).then(result => {
//     resp.json({
//       code: 'SUCCESS',
//       message: '获取数据成功',
//       result: {
//         page: result[0],
//         list:result[1]
//       }
//     })
//   })
// })

module.exports = router