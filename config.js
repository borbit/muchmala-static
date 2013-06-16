var path = require('path');

module.exports = {
  host: '0.0.0.0'
, port: process.env.PORT || '8002'

, ioUrl     : process.env.IO_URL     || 'http://localhost:8001'
, apiUrl    : process.env.API_URL    || 'http://localhost:8003'
, staticUrl : process.env.STATIC_URL || 'http://localhost:8002'

, publicRoot : path.join(__dirname, 'public')
, distsRoot  : path.join(__dirname, 'dists')

, s3Bucket : process.env.S3_BUCKET || 'your_s3_bucket'
, s3Secret : process.env.S3_SECRET || 'your_s3_secret'
, s3Key    : process.env.S3_KEY    || 'your_s3_key'

, gaKey  : process.env.GA_KEY
};