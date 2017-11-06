var express = require('express')
var router = express.Router()
let mysql = require('../../config/mysql')
const Response = require('../../config/response')
let redis = require('../../config/redis')
let debug = require('debug')('express-web-tools:menu')

function getMenusFromMysql(req, res, next) {
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
      results.forEach(element => {
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
    
    redis.set('menus', JSON.stringify(data), (err) => {
      if (err) {
        debug('Redis写入失败')
      }
    })

    res.json(Response.success({
      code: 'SUCCESS',
      message: '获取数据成功',
      result: data
    }))
  })
}

router.get('/', function (req, res, next) {

  redis.get('menus', (err, result) => {
    // Redis获取异常
    if (err) {
      debug(`获取redis菜单数据错误${err}`)
      getMenusFromMysql(req, res, next)
      return
    }
    // Redis没有数据
    if (!result) {
      getMenusFromMysql(req, res, next)
      return
    }
    // 尝试获取数据
    let data = undefined
    try {
      data = JSON.parse(result)
      res.json(Response.success({
        code: 'SUCCESS',
        message: '获取数据成功',
        result: data
      }))
    } catch (e) {
      // 数据异常
      getMenusFromMysql(req, res, next)
    }
  })
})

module.exports = router