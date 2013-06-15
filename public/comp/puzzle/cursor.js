(function() {
  function Cursor(op) {
    this.color = op.color;
    this.tileSize = op.tileSize;
    this.stepSize = op.stepSize;
    this.render();
  }

  var Proto = Cursor.prototype;

  Proto.render = function() {
    this.$el = $('<div></div>');
    this.$el.addClass('cursor');
    this.$el.css({
      background: this.color
    , height: this.tileSize + 2
    , width: this.tileSize + 2
    });
  };

  Proto.move = function(x, y) {
    this.$el.css({
      x: x * (this.tileSize + 1) + this.stepSize - 1
    , y: y * (this.tileSize + 1) + this.stepSize - 1
    });
  };

  Proto.show = function() {
    this.$el.show();
  };

  Proto.hide = function() {
    this.$el.hide();
  };

  Proto.pulse = function(cb) {
    this.$el.transit({opacity: 0}, 140);
    this.$el.transit({opacity: 1}, 140);
    this.$el.transit({opacity: 0}, 140, cb);
  };

  Proto.remove = function() {
    this.$el.remove();
  };

  ns.Comp.Cursor = Cursor;
})();