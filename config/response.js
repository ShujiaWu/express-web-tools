module.exports = {
  success (response) {
    let res = {
      code: 'SUCCESS', 
      message: '操作成功'
    }
    Object.assign(res, response)
    return res
  },
  error () {
    let res = {
      code: 'ERROR', 
      message: '操作失败'
    }
    Object.assign(res, response)
    return res
  }
}