(function() {
  'use strict'

  function Puzzle(op) {
    this.game = op.game;    
    this.loader = new ns.Loader(STATIC_URL);

    this.$view = $('.puzzle');
    this.$cont = $('.puzzle__cont');
    this.$cont.hammer();

    this.reset();
    this.enableGameEvents();
  }

  var Proto = Puzzle.prototype;

  Proto.reset = function() {
    this.$cont.empty();
    this.$cont.css({x: 0, y: 0});
    this.disableDOMEvents();

    this.data = {};
    this.pieces = {};
    this.timers = {};
    this.canvas = null;
    this.spritesImgs = {};
    this.coversImgs = null;
    this.selected = null;
    this.cursor = null;
    this.frame = null;
    
    this.waiting = false;
    this.contMoved = false;
    this.contDelta = {x: 0, y: 0};

    this.tileSize = null;
    this.stepSize = null;
  };

  Proto.init = function(data) {
    var self = this;

    this.reset();
    this.loader.on('sprite', function(sx, sy, sprite) {
      self.spritesImgs[sx] || (self.spritesImgs[sx] = {});
      self.spritesImgs[sx][sy] = sprite;
      self.showPieces(sx, sy);
    });

    this.loader.once('sprite:finish', function() {
      self.loader.off('sprite');

      setTimeout(function finish() {
        if (!self.coversImgs || !self.frame) {
          return setTimeout(finish, 50);
        }
        self.frame.render();
        self.$cont.append(self.frame.canvas);
        self.game.getPuzzle(self.data.id);
        self.game.trigger('puzzle:load');
        self.enableDOMEvents();
      }, 50);
    });
    
    this.loader.once('covers', function(covers) {
      self.coversImgs = covers;
    });

    this.loader.once('frame', function(frame) {
      self.frame = new ns.Comp.Frame({
        image: frame
      , stepSize: self.stepSize
      , tileSize: self.tileSize
      , lenHor: self.data.lenHor
      , lenVer: self.data.lenVer
      , canvas: self.canvas
      , pieces: self.pieces
      });
    });

    this.data = data;
    this.loader.loadCovers(data);
    this.loader.loadSprites(data);
    this.loader.loadFrame(data);
    this.game.trigger('puzzle:loading');
    
    this.tileSize = ns.Comp.Piece.calcTileSize(data.pieceSize);
    this.stepSize = ns.Comp.Piece.calcStepSize(data.pieceSize);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('puzzle__pieces');
    this.ctx = this.canvas.getContext('2d');

    this.cursor = new ns.Comp.Cursor({
      tileSize: this.tileSize
    , stepSize: this.stepSize
    , body: this.$cont
    });

    var size = this.getViewportSize();
    this.canvas.height = size.height;
    this.canvas.width = size.width;

    this.$cont.css({height: size.height, width: size.width});
    this.$cont.append(this.cursor.$el);
    this.$cont.append(this.canvas);
    this.arrangeContPos();
  };

  Proto.update = function(data) {
    var self = this;

    this.data = data;
    this.data.pieces.forEach(function(val, i) {
      var c = self.getPieceCoords(i);
      var rc = self.getPieceRCoords(val);
      var piece = self.pieces[c.x][c.y];

      if (piece.rx != rc.x || piece.ry != rc.y) {
        piece.rx = rc.x;
        piece.ry = rc.y;
        self.updatePiece(piece);
      }

      piece.isSelected() && self.releasePiece(piece);
      piece.isBlocked() && self.unblockPiece(piece);

      var selData = self.data.selected[i];

      if (selData) {
        if (selData.my) {
          self.selectPiece(piece, selData);
        } else {
          self.blockPiece(piece, selData);
        }
      }
    });
  };

  Proto.getViewportSize = function() {
    return {
      height : (this.tileSize + 1) * this.data.lenVer + this.stepSize * 2
    , width  : (this.tileSize + 1) * this.data.lenHor + this.stepSize * 2
    };
  };

  Proto.arrangeContDelta = function(delta) {
    if (!this.contMoved || this.viewW > this.contW) {
      delta.x = ~~((this.viewW - this.contW) / 2);
    }
    if (!this.contMoved || this.viewH > this.contH) {
      delta.y = ~~((this.viewH - this.contH) / 2);
    }
    if (delta.x < 0 && delta.x + this.contW < this.viewW) {
      delta.x = this.viewW - this.contW;
    }
    if (delta.x > 0 && delta.x + this.contW > this.viewW) {
      delta.x = 0;
    }
    if (delta.y < 0 && delta.y + this.contH < this.viewH) {
      delta.y = this.viewH - this.contH;
    }
    if (delta.y > 0 && delta.y + this.contH > this.viewH) {
      delta.y = 0;
    }
    return delta;
  };

  Proto.arrangeContPos = function() {
    this.viewW = this.$view.width();
    this.viewH = this.$view.height();
    this.contW = this.$cont.outerWidth();
    this.contH = this.$cont.outerHeight();
    this.contDelta = this.arrangeContDelta(this.contDelta);
    this.$cont.css(this.contDelta);
  };

  Proto.enableDOMEvents = function() {
    var self = this;
    this.$cont.bind('drag', function(e, dd) {
      self.contMoved = true;
      self.$cont.css(self.arrangeContDelta({
        x: ~~(self.contDelta.x + dd.deltaX)
      , y: ~~(self.contDelta.y + dd.deltaY)
      }));
    });

    this.$cont.bind('dragend', function(e, dd) {
      self.contDelta = self.arrangeContDelta({
        x: ~~(self.contDelta.x + dd.deltaX)
      , y: ~~(self.contDelta.y + dd.deltaY)
      });
    });

    this.$cont.bind('mousemove', function(e) {
      var piece = self.findPiece(e.clientX, e.clientY);

      if (!piece) return;
      if (piece.isActive()) {
        self.$cont.css('cursor', 'pointer');
        self.cursor.move(piece.x, piece.y);
        self.cursor.show();
      }
      if (piece.isBlocked() || !piece.isActive()) {
        self.$cont.css('cursor', 'default');
        self.cursor.hide();
      }
    });

    this.$cont.bind('click tap', function(e) {
      var piece = self.findPiece(e.clientX, e.clientY);

      if (!piece || !piece.isActive() || piece.isBlocked() || self.waiting)
        return;

      if (self.selected && self.selected !== piece) {
        if (self.selected.shapeKey() == piece.shapeKey()) {
          var selec = self.selected;
          var piece1Index = selec.index;
          var piece2Index = piece.index;

          selec.setWaiting();
          piece.setWaiting();

          self.waiting = true;
          self.game.swapPieces(self.data.id, piece1Index, piece2Index, function(data) {
            self.clearFavicon();
            self.showScore(data.score);
            self.swapPieces(data.pieces);
            self.selected = null;
            self.waiting = false;
          });
        } else {
          piece.pulse();
        }
      }
      else if (!piece.isSelected()) {
        piece.setWaiting();
        
        self.waiting = true;
        self.game.selectPiece(self.data.id, piece.index, function(data) {
          self.selectPiece(piece, data);
          self.waiting = false;
        });
      }
      else if (piece.isSelected()) {
        piece.setWaiting();
        
        self.waiting = true;
        self.game.releasePiece(self.data.id, piece.index, function() {
          self.releasePiece(piece);
          self.waiting = false;
        });
      }
    });

    this.$cont.bind('contextmenu', function(e) {
      if (self.selected) {
        self.selected.setWaiting();

        self.waiting = true;
        self.game.releasePiece(self.data.id, self.selected.index, function() {
          self.releasePiece(self.selected);
          self.waiting = false;
        });
      }
      e.preventDefault();
      return false;
    });

    $(window).resize(function() {
      self.arrangeContPos();
    });
  };

  Proto.disableDOMEvents = function() {
    $(window).unbind('resize');
    this.$cont.unbind();
  };

  Proto.enableGameEvents = function() {
    var self = this;

    this.game.on('puzzle', function(data) {
      if (self.data.id != data.id) {
        self.init(data);
      } else {
        self.update(data);
      }
    });

    this.game.on('select', function(data) {
      var c = self.getPieceCoords(data.pieceIndex);
      self.blockPiece(self.pieces[c.x][c.y], data);
    });

    this.game.on('release', function(data) {
      var c = self.getPieceCoords(data.pieceIndex);
      self.unblockPiece(self.pieces[c.x][c.y]);
    });

    this.game.on('swap', function(data) {
      self.swapPieces(data.pieces);
    });
  };

  Proto.selectPiece = function(piece, data) {
    piece.unsetWaiting();
    piece.setSelected();
    
    this.updatePiece(piece);
    this.setFavicon(piece.shapeKey());
    this.selected = piece;

    var self = this;
    this.timers[piece.x] || (this.timers[piece.x] = {});
    this.timers[piece.x][piece.y] = setTimeout(function() {
      self.timers[piece.x][piece.y] = null;
      self.releasePiece(piece);
    }, data.ttl);
  };

  Proto.releasePiece = function(piece) {
    if (this.timers[piece.x] && this.timers[piece.x][piece.y]) {
      clearTimeout(this.timers[piece.x][piece.y]);
      delete this.timers[piece.x][piece.y];
    }
    piece.unsetWaiting();
    piece.unsetSelected();
    this.updatePiece(piece);
    this.selected = null;
    this.clearFavicon();
  };

  Proto.blockPiece = function(piece, data) {
    piece.unsetWaiting();
    piece.setBlocked(data);
    this.updatePiece(piece);

    var self = this;
    this.timers[piece.x] || (this.timers[piece.x] = {});
    this.timers[piece.x][piece.y] = setTimeout(function() {
      self.timers[piece.x][piece.y] = null;
      self.unblockPiece(piece);
    }, data.ttl);
  };

  Proto.unblockPiece = function(piece) {
    if (this.timers[piece.x] && this.timers[piece.x][piece.y]) {
      clearTimeout(this.timers[piece.x][piece.y]);
      delete this.timers[piece.x][piece.y];
    }
    piece.unsetWaiting();
    piece.unsetBlocked();
    this.updatePiece(piece);
  };

  Proto.findPiece = function(ex, ey) {
    var offset = this.$cont.offset();

    ex -= offset.left;
    ey -= offset.top;
    
    var px = ~~((ex - this.stepSize) / (this.tileSize + 1));
    var py = ~~((ey - this.stepSize) / (this.tileSize + 1));
    var found = [];

    for (var x = px - 1; x < px + 1; x++) {
    for (var y = py - 1; y < py + 1; y++) {
      if (this.pieces[x] && this.pieces[x][y] &&
          this.pieces[x][y].hasPoint(ex, ey)) {
        return this.pieces[x][y];
      }
    }}
  };

  Proto.showPieces = function(sx, sy) {
    var self = this;

    if (!this.coversImgs) {
      return setTimeout(function() {
        self.showPieces(sx, sy);
      }, 50);
    }

    var x1 = sx * this.data.spriteSize;
    var y1 = sy * this.data.spriteSize;
    var x2 = x1 + this.data.spriteSize;
    var y2 = y1 + this.data.spriteSize;

    _.each(this.data.pieces, function(val, i) {
      var rc = self.getPieceRCoords(val);

      if (rc.x >= x1 && rc.x < x2 &&
          rc.y >= y1 && rc.y < y2) {

        var c = self.getPieceCoords(i);
        var piece = self.createPiece({
          index: i
        , x: c.x, y: c.y
        , rx: rc.x, ry: rc.y
        , t: ns.Comp.Piece.earT(val)
        , b: ns.Comp.Piece.earB(val)
        , l: ns.Comp.Piece.earL(val)
        , r: ns.Comp.Piece.earR(val)
        , canvas: self.canvas
        , ctx: self.ctx
        });

        self.pieces[c.x] || (self.pieces[c.x] = {});
        self.pieces[c.x][c.y] = piece;
        piece.draw();
      }
    });
  };

  Proto.createPiece = function(op) {
    return new ns.Comp.Piece(_.extend({
      pieceSize: this.data.pieceSize
    , spriteSize: this.data.spriteSize
    , sprites: this.spritesImgs
    , covers: this.coversImgs
    }, op));
  };

  Proto.swapPieces = function(pieces) {
    var self = this;
    _.each(pieces, function(val, i) {
      var c = self.getPieceCoords(i);
      var rc = self.getPieceRCoords(val);
      var piece = self.pieces[c.x][c.y];

      piece.rx = rc.x;
      piece.ry = rc.y;
      piece.unsetWaiting();
      
      if (piece.isSelected()) {
        self.releasePiece(piece);
      } else if (piece.isBlocked()) {
        self.unblockPiece(piece);
      } else {
        self.updatePiece(piece);
      }
    });
  };

  Proto.updatePiece = function(piece) {
    var self = this;

    ns.utils.requestAnimationFrame(function() {
      var x1 = Math.max(0, piece.x - 1);
      var y1 = Math.max(0, piece.y - 1);
      var x2 = Math.min(self.data.lenHor - 1, piece.x + 1);
      var y2 = Math.min(self.data.lenVer - 1, piece.y + 1);

      var first = self.pieces[x1][y1];
      var clone, exist;
      
      var canvas = document.createElement('canvas');
      canvas.height = (self.tileSize + 1) * 3 + self.stepSize * 2;
      canvas.width = (self.tileSize + 1) * 3 + self.stepSize * 2;
      var ctx = canvas.getContext('2d');

      for (var x = x1; x <= x2; x++) {
      for (var y = y1; y <= y2; y++) {
        exist = self.pieces[x][y];
        clone = self.createPiece({
          x: x, y: y
        , rx: exist.rx, ry: exist.ry
        , t: exist.t, b: exist.b
        , l: exist.l, r: exist.r
        , ctx: ctx
        });

        clone.cx -= first.cx;
        clone.cy -= first.cy;
        clone.selected = exist.selected;
        clone.blocked = exist.blocked;
        clone.draw();
      }}
      
      self.ctx.clearRect(piece.cx, piece.cy, self.data.pieceSize, self.data.pieceSize);
      self.ctx.drawImage(canvas, piece.cx-first.cx, piece.cy-first.cy, self.data.pieceSize,
        self.data.pieceSize, piece.cx, piece.cy, self.data.pieceSize, self.data.pieceSize);
    });
  };

  Proto.showScore = function(score) {
    var self = this;
    _.each(score, function(score, i) {
      var c = self.getPieceCoords(i);
      var piece = self.pieces[c.x][c.y];
      piece.showScore(score);
    });
  };

  Proto.getPieceCoords = function(index) {
    return {
      x: ~~(index % this.data.lenHor)
    , y: ~~(index / this.data.lenHor)
    };
  };

  Proto.getPieceRCoords = function(val) {
    var org = ns.Comp.Piece.origin(val);
    return {
      x: ~~(org % this.data.lenHor)
    , y: ~~(org / this.data.lenHor)
    };
  };

  Proto.setFavicon = function(name) {
    $('link[rel="shortcut icon"]').remove();

    var favicon = $('<link>');
    var href = STATIC_URL + '/img/favicon' + (name ? '_' + name : '') + '.png';

    favicon.attr('rel', 'shortcut icon');
    favicon.attr('href', href);
    favicon.appendTo(document.head);
  };

  Proto.clearFavicon = function() {
    this.setFavicon();
  };

  ns.Comp.Puzzle = Puzzle;
})();