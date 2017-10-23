module.exports = {
  /**
   * 生成响应数据
   * @param {* Object} _default 默认的值
   * @param {*} args 返回的数据
   */
  _message (_default, args) {
    let code = _default.code 
    let message = _default.message
    let data = undefined
    switch (args.length) {
      case 1:
        if (typeof args[0] === 'string') {
          message = args[0]
        } else {
          data = args[0]
        }
        break
      case 2:
        message = args[0]
        data = args[1]
        break
      case 3:
        code = args[0]
        message = args[1]
        data = args[2]
        break
    }
    if (args.length == 1) {
      data = args[0]
    }
    return {
      code: code,
      message: message,
      result: data
    }
  },
  /**
   * 成功的数据
   * @param {* Number} code 状态码
   * @param {* String} msg 消息 
   * @param {* Object} data 数据
   */
  success () {
    return this._message({code: 'SUCCESS', message: '操作成功'}, arguments)
  },
  /**
   * 失败的数据
   * @param {* Number} code 状态码
   * @param {* String} msg 消息 
   * @param {* Object} data 数据
   */
  error () {
    return this._message({code: 'ERROR', message: '操作失败'}, arguments)
  }
}