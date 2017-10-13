let express = require('express')
let router = express.Router()
let path = require('path')
let fs = require('fs')
let root = process.cwd()

router.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Headers', 'User-Gps')
  next()
})

function getContent(name, req, res) {
  let fileContent
  try {
    fileContent = fs.readFileSync(name, 'utf-8')
    res.status(200).json(JSON.parse(fileContent))
  } catch (e) {
    res.status(400).json({
      code: 'Error',
      message: e.message
    })
  }
}

router.all('*', function (req, res, next) {
  console.log('请求模拟数据:', req.method, req.path)
  console.log('参数（Query）:', req.query)
  console.log('参数（Params）:', req.body)
  console.log('')

  if (req.path.indexOf('error') === -1) {
    next()
  } else {
    res.status(400).json({
      code: 'Error',
      message: '错误'
    })
  }
})

// GET
router.get('*', function (req, res) {
  let file = req.path.replace('/mock', '')
  file = path.join(root, `/mock/get${file}`)
  getContent(file, req, res)
})

// POST
router.post('*', function (req, res) {
  let file = req.path.replace('/mock', '')
  file = path.join(root, `/mock/post${file}`)
  getContent(file, req, res)
})

// PUT
router.put('*', function (req, res) {
  let file = req.path.replace('/mock', '')
  file = path.join(root, `/mock/put${file}`)
  getContent(file, req, res)
})

// DELETE
router.delete('*', function (req, res) {
  let file = req.path.replace('/mock', '')
  file = path.join(root, `/mock/delete${file}`)
  getContent(file, req, res)
})

module.exports = router 