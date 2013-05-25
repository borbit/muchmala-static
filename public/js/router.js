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
    this.game.fetchUser();
    this.game.getFirstPuzzle();
  },

  puzzle: function(id) {
    this.game.fetchUser();
    this.game.getPuzzle(id);
  },

  sign: function(hash) {
    this.game.fetchUser(hash);
    this.game.getFirstPuzzle();
    this.navigate('/');
  }
});