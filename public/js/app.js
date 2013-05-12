// some bootstrap
// make hammer.js not to handle mouse events
Hammer.NO_MOUSEEVENTS = true;

(function() {
  var socket = new ns.Socket(IO_URL);
  var user = new ns.Models.User();
  var game = new ns.Game({
    socket: socket
  , user: user
  });

  var puzzle = new ns.Comp.Puzzle({game: game});

  game.connect(function() {
    game.fetchUser(function() {
      game.getFirst();
    });
  });
})();