let redis = require('redis')

const RDS_HOST = '192.168.36.10'
const RDS_PORT = 6379
const RDS_OPTS = {}

let client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS)

client.on('read', function(res) {
  console.log('【Redis】 redis on ready')
})

module.exports = client