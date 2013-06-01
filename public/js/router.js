ns.Router = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'puzzle/:id': 'puzzle'
  , 'sign/:hash': 'sign'
  },

  initialize: function(op) {
    this.game = op.game;
  },

  index: function() {
    var self = this;
    this.game.fetchUser(function() {
      self.game.getFirstPuzzle();
    });
  },

  puzzle: function(id) {
    var self = this;
    this.game.fetchUser(function() {
      self.game.getPuzzle(id);
    });
  },

  sign: function(hash) {
    var self = this;
    this.game.fetchUser(hash, function() {
      self.game.getFirstPuzzle();
      self.navigate('/');
    });
  }
});