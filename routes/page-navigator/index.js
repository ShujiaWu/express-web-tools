var express = require('express')
var router = express.Router()
// const Menu = require('./schema/menu')
// let initData = require('./data/init')
let mysql = require('../../config/mysql')

const PageConfig = {
  size: 10,
  now: 1
}
router.get('/', function (req, res, next) {
  mysql.query('select * from page_navigator where is_deleted = 0 and enabled = 1', null, (err, results, fields) => {
    if (err) {
      next(err)
      return
    }
    let data = []
    if (results && results.length) {
      let groups = {}

      results.forEach(element => {
        if (!element.parent) {
          // 菜单组
          groups[element.id] = {
            id: element.id,
            icon: element.icon,
            name: element.name,
            list: []
          }
          data.push(groups[element.id])
        } else {
          // 菜单
          groups[element.parent].list.push({
            id: element.id,
            icon: element.icon,
            name: element.name,
            target: JSON.parse(element.target)
          })
        }
      }, this)
    }
    res.json({
      code: 'SUCCESS',
      message: '获取数据成功',
      result: data
    })
  })
})

module.exports = router