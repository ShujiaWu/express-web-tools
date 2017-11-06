let express = require('express')
let router = express.Router()
let Response = require('../config/response')

let users = require('./users')
let menu = require('./menu/index')
let pageNavigator = require('./page-navigator/index')
let monitor = require('./monitor/index')
let mock = require('./mock')
let FnsTester = require('./fns-tester/index')

router.use('/users', users)
router.use('/api/monitor/v1', monitor)
router.use('/mock', mock)
router.use('/api/menus', menu)
router.use('/api/page-navigator', pageNavigator)
router.use('/api/fns-tester', FnsTester)

// 接口 404
router.use('/api/*', function (req, res, next) {
  res.status(404).json({
    code: 'Error-404',
    message: 'NOT FOUND'
  })
})

// 普通页面 404
router.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// 接口错误
router.use('/api', function (err, req, res, next) {
  res.status(400).json({
    code: 'Error',
    message: err.message
  })
})

// 普通页面错误
router.use(function(err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = router
