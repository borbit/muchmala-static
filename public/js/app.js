// some bootstrap
// make hammer.js not to handle mouse events
Hammer.NO_MOUSEEVENTS = true;

(function() {
  var user = new ns.Models.User();
  var game = new ns.Game({
    host: IO_URL
  , user: user
  });

  var puzzle = new ns.Comp.Puzzle({game: game});

  game.connect(function() {
    game.fetchUser(function() {
      game.getFirst();
    });
  });
})();