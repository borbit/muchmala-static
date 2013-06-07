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
  var router = new ns.Router({game: game});

  game.connect(function() {
    Backbone.history.start({pushState: true});
  });

  game.on('disconnect', function() {
    var p = ns.Popups.top(ns.texts.disconnect);
    game.once('reconnect', function() {
      ns.Popups.top(ns.texts.reconnect, {time: 2000});
      p.hide();
    });
    game.once('reconnect_failed', function() {
      ns.Popups.top(ns.texts.reconnect_failed);
      p.hide();
    });
  });
})();