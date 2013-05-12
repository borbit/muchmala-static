(function() {
  function Socket(host) {
    this.host = host;
    this.socket = null;
  };

  var Proto = _.extend(Socket.prototype, Backbone.Events);

  Proto.connect = function() {
    var self = this;
    
    window.socket = this.socket = io.connect(this.host, {
      'max reconnection attempts' : 20
    , 'reconnection delay'        : 1000
    , 'reconnection limit'        : 1000
    });

    var pass = ['connect', 'reconnect', 'disconnect', 'release', 'select'];

    _.each(pass, function(event) {
      self.socket.on(event, function(data) {
        self.trigger.call(self, event, data);
      });
    });

    this.socket.on('reconnecting', function(d, attempt) {
      if (attempt == 20) {
        self.trigger('reconnect_failed');
      }
    });
  };

  Proto.user = function(user, cb) {
    this.socket.emit('user', {user: user}, cb);
  };

  Proto.puzzle = function(puzzleId, user, cb) {
    var payload = {user: user};
    puzzleId && (payload.puzzleId = puzzleId);
    this.socket.emit('puzzle', payload, cb);
  };

  Proto.select = function(puzzleId, pieceIndex, user, cb) {
    this.socket.emit('select', {pieceIndex: pieceIndex
      , puzzleId: puzzleId, user: user}, cb);
  };

  Proto.release = function(puzzleId, pieceIndex, user, cb) {
    this.socket.emit('release', {pieceIndex : pieceIndex
      , puzzleId: puzzleId, user: user}, cb);
  };

  ns.Socket = Socket;
})();