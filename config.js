var path = require('path');

module.exports = {
  host: process.env.STATIC_HOST || '0.0.0.0'
, port: process.env.STATIC_PORT || '8002'

, ioUrl     : process.env.IO_URL     || 'http://localhost:8001'
, apiUrl    : process.env.API_URL    || 'http://localhost:8003'
, staticUrl : process.env.STATIC_URL || 'http://localhost:8002'

, publicRoot : path.join(__dirname, 'public')
, distsRoot  : path.join(__dirname, 'dists')

, bucket : 'your_s3_bucket'
, secret : 'your_s3_secret'
, key    : 'your_s3_key'
};