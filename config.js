module.exports = {
  host: process.env.STATIC_HOST || '0.0.0.0'
, port: process.env.STATIC_PORT || '8002'

, ioUrl     : process.env.IO_URL     || 'http://192.168.10.160:8001'
, apiUrl    : process.env.API_URL    || 'http://192.168.10.160:8003'
, staticUrl : process.env.STATIC_URL || ''
};