(function() {
  function Game(options) {
    this.user = options.user;
    this.host = options.host;
    this.socket = null;
  }

  var Proto = _.extend(Game.prototype, Backbone.Events);

  Proto.connect = function(cb) {
    this.socket = io.connect(this.host, {
      'max reconnection attempts' : 20
    , 'reconnection delay'        : 1000
    , 'reconnection limit'        : 1000
    });

    this.socket.on('reconnecting', function(d, attempt) {
      if (attempt == 20) self.trigger('reconnect_failed');
    });
    var self = this;
    this.socket.on('connect', cb);
    this.socket.on('select', function(data) {
      self.trigger('select', data);
    });
    this.socket.on('release', function(data) {
      self.trigger('release', data);
    });
    this.socket.on('swap', function(data) {
      self.trigger('swap', data.swap);
    });
  };

  Proto.fetchUser = function(signHash, cb) {
    if (_.isFunction(signHash)) {
      cb = signHash;
    }

    var self = this;
    var auth = this.getAuthData();
    if (_.isString(signHash)) {
      auth.signHash = signHash;
    }

    this.socket.emit('user', {user: auth}, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      self.user.set(res.user);
      cb && cb(self.user);
    });
  };

  Proto.getFirstPuzzle = function(cb) {
    var self = this;
    var auth = this.getAuthData();

    this.socket.emit('puzzle', {user: auth}, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      self.trigger('puzzle', res.puzzle);
      cb && cb(res.puzzle);
    });
  };

  Proto.getPuzzle = function(puzzleId, cb) {
    var self = this;
    var auth = this.getAuthData();
    var payload = {
      puzzleId: puzzleId
    , user: auth
    };

    this.socket.emit('puzzle', payload, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      self.trigger('puzzle', res.puzzle);
      cb && cb(res.puzzle);
    });
  };

  Proto.selectPiece = function(puzzleId, pieceIndex, cb) {
    var self = this;
    var auth = this.getAuthData();
    var payload = {
      pieceIndex: pieceIndex
    , puzzleId: puzzleId
    , user: auth
    };

    this.socket.emit('select', payload, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      cb && cb(res.selected);
    });
  };

  Proto.releasePiece = function(puzzleId, pieceIndex, cb) {
    var self = this;
    var auth = this.getAuthData();
    var payload = {
      pieceIndex: pieceIndex
    , puzzleId: puzzleId
    , user: auth
    };

    this.socket.emit('release', payload, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      cb && cb();
    });
  };

  Proto.swapPieces = function(puzzleId, piece1Index, piece2Index, cb) {
    var self = this;
    var auth = this.getAuthData();
    var payload = {
      piece1Index: piece1Index
    , piece2Index: piece2Index
    , puzzleId: puzzleId
    , user: auth
    };

    this.socket.emit('swap', payload, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      if (res.user) {
        self.user.set(res.user);
      }
      cb && cb(res.swap);
    });
  };

  Proto.getAuthData = function() {
    var data = {};
    if (this.user.id) {
      data.userId = this.user.id;
    }
    return data;
  };

  Proto.triggerError = function(error) {
    this.trigger('error:' + error.name, error.data);
  };

  ns.Game = Game;
})();