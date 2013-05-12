(function() {
  function Game(options) {
    this.socket = options.socket;
    this.user = options.user;
  }

  var Proto = _.extend(Game.prototype, Backbone.Events);

  Proto.connect = function(cb) {
    this.socket.once('connect', cb);
    this.socket.connect(); 

    this.listenTo(this.socket, 'select', function(data) {
      this.trigger('select', data);
    });
    this.listenTo(this.socket, 'release', function(data) {
      this.trigger('release', data);
    });
  };

  Proto.fetchUser = function(hash, cb) {
    if (_.isFunction(hash)) {
      cb = hash;
    }

    var self = this;
    var auth = this.getAuthData();
    if (_.isString(hash)) {
      auth.signHash = hash;
    }

    this.socket.user(auth, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      self.user.set(res.user);
      cb && cb(self.user);
    });
  };

  Proto.getFirst = function(cb) {
    var self = this;
    var auth = this.getAuthData();

    this.socket.puzzle(null, auth, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      self.trigger('puzzle', res.puzzle);
      cb && cb(res.puzzle);
    });
  };

  Proto.getPuzzle = function(id, cb) {
    var self = this;
    var auth = this.getAuthData();

    this.socket.puzzle(id, auth, function(res) {
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

    this.socket.select(puzzleId, pieceIndex, auth, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      cb && cb(res.selected);
    });
  };

  Proto.releasePiece = function(puzzleId, pieceIndex, cb) {
    var self = this;
    var auth = this.getAuthData();

    this.socket.release(puzzleId, pieceIndex, auth, function(res) {
      if (res.error) {
        return self.triggerError(res.error);
      }
      cb && cb();
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