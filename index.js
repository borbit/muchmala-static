var express = require('express');
var cons = require('consolidate');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');

ejs.open = '<#';
ejs.close = '#>';

function cors(req, res, next) {
  var allowedHosts = [
    'http://muchmala.dev'
  , 'http://muchmala.com'
  ];

  if (~allowedHosts.indexOf(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-HTTP-Method-Override');
    req.method == 'OPTIONS' ? res.send(200) : next();
  } else {
    next();
  }
}

exports.createServer = function(config, cb) {
  var app = express();
  app.locals.ioUrl     = config.ioUrl;
  app.locals.staticUrl = config.staticUrl;
  app.locals.apiUrl    = config.apiUrl;
  app.locals.gaKey     = config.gaKey;

  app.configure('development', function() {
    app.locals.css = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/css.json')));
    app.locals.js = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/js.json')));
  });

  app.configure(function() {
    app.use(cors);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'dist')));
    app.engine('html', cons.ejs);

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
  });

  app.get('/*', function(req, res) {
    res.render('index.html');
  });
  
  app.listen(config.port, config.host, cb);
};
