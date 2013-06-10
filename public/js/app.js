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
  var puzzle = new ns.Models.Puzzle();
  var game = new ns.Game({
    host: IO_URL
  , puzzle: puzzle
  , user: user
  });

  new ns.Comp.Puzzle({game: game});
  new ns.Comp.Panel({game: game});
  new ns.Router({game: game});

  game.once('connect', function() {
    Backbone.history.start({pushState: true});
  });

  game.on('disconnect', function() {
    var p = ns.Popups.top(ns.texts.disconnect);
    game.once('reconnect', function() {
      ns.Popups.top(ns.texts.reconnect, {time: 2000});
      game.getPuzzle(puzzle.get('id'));
      p.hide();
    });
    game.once('reconnect_failed', function() {
      ns.Popups.top(ns.texts.reconnect_failed);
      p.hide();
    });
  });

  puzzle.on('change:status', function() {
    if (puzzle.get('status') == 100) {
      ns.Popups.mid(ns.texts.finished);
    }
  });

  setTimeout(function() {
    ns.Popups.mid(ns.texts.finished);
  }, 2000);

  game.connect();
})();