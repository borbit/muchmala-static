// some bootstrap
// make hammer.js not to handle mouse events
Hammer.NO_MOUSEEVENTS = true;
// make all the animation to be linear by default
$.cssEase._default = 'linear';
// jQuery.Drag.Events
$.event.special.drag.defaults.distance = 10;
$.event.special.drag.defaults.relative = true;

(function() {
  var user = new ns.Models.User();
  var game = new ns.Game({
    host: IO_URL
  , user: user
  });

  var puzzle = new ns.Comp.Puzzle({game: game});
  var panel = new ns.Comp.Panel({game: game});

  game.connect(function() {
    game.fetchUser(function() {
      game.getFirst();
    });
  });
})();