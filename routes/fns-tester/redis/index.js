let express = require('express')
let router = express.Router()
let Response = require('../../../config/Response')
let redis = require('../../../config/redis')

// 获取String类型的值
router.get('/get/:key', (req, res, next) => {
  let key = req.params.key
  redis.get(key, (err, result) => {
    if (err) {
      next(err)
      return
    }
    res.json(Response.success({
      key: key,
      value: result
    }))
  })
})
// 获取String类型的值 -- 没有传值
router.get('/get/' , (req, res, next) => {
  next(new Error('请求异常'))
})

router.post('/set', (req, res, next) => {
  let key = req.body.key
  let value = req.body.value
  console.log(key)
  console.log(value)
  redis.set(key, value, (err) => {
    if (err) {
      next(err)
      return
    }
    res.json(Response.success({
      result: {
        key: key,
        value: value
      }
    }))
  })
})

module.exports = router