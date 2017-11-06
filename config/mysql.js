let mysql = require('mysql')
let debug = require('debug')('express-web-tools:mysql')

let pool = mysql.createPool({
  host: '192.168.36.10',
  // host: 'localhost',
  user: 'root',
  password: 'root',
  port: '3306',
  database: 'express-web-tool'
})

pool.on('enqueue', function () {
  debug('Waiting for available connection slot');
})

pool.on('release', function (connection) {
  debug('Connection %d released', connection.threadId);
})

module.exports = {
  pool: pool,
  query (sql, options, callback) {
    pool.getConnection((err, conn) => {
      if (err) {
        // 回调
        callback(err, null, null)
      } else {
        conn.query(sql, options, (err, results, fields) => {
          // 释放链接
          conn.release()
          // 回调
          callback(err, results, fields)
        })
      }
    })
  }
}