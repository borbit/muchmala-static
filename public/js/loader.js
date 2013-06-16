(function() {
  function Loader(host) {
    this.host = host;
  };

  var Proto = _.extend(Loader.prototype, Backbone.Events);

  Proto.image = function(src, cb) {
    var image = document.createElement('img');
    image.src = this.host + src;
    image.onload = function() {
      cb(image);
    };
  };

  Proto.loadSprites = function(data) {
    var lh = Math.ceil(data.lenHor / data.spriteSize);
    var lv = Math.ceil(data.lenVer / data.spriteSize);
    var self = this;

    var finish = _.after(lh * lv, function() {
      self.trigger('sprite:finish');
    });

    _.each(_.range(0, lh), function(x) {
    _.each(_.range(0, lv), function(y) {
      var src = sprintf('/puzzles/%s/%d_%d_pieces.png', data.id, x, y);
      self.image(src, function(image) {
        self.trigger('sprite', x, y, image);
        finish();
      });
    });
    });
  };

  Proto.loadCovers = function(data) {
    var covers = {};
    var types = ['def', 'loc', 'sel'];
    var cb = _.after(types.length, function() {
      self.trigger('covers', covers);
    });

    var self = this;
    _.each(types, function(type) {
      var src = sprintf('/covers/%d/%s_covers.png', data.pieceSize, type);
      self.image(src, function(image) {
        covers[type] = image;
        cb();
      });
    });
  };

  Proto.loadFrame = function(data) {
    var self = this;
    var src = sprintf('/frames/%d/frame.png', data.pieceSize);
    this.image(src, function(image) {
      self.trigger('frame', image);
    });
  };

  ns.Loader = Loader;
})();