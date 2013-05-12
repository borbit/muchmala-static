(function() {
  'use strict'

  function Puzzle(op) {
    this.game = op.game;
    
    this.data = {};
    this.pieces = {};
    this.spritesImgs = {};
    this.coversImgs = null;
    this.selected = null;
    this.frame = null

    this.loader = new ns.Loader(STATIC_URL);
    
    this.$view = $('.puzzle');
    this.$cont = $('.puzzle__cont');
    this.$curs = $('.puzzle__curs');
    this.$cont.hammer();

    this.contDeltaX = 0;
    this.contDeltaY = 0;
    this.contMoved = false;
    this.tileSize = null;
    this.stepSize = null;

    this.enableGameEvents();
    this.enableDOMEvents();
  }

  var Proto = Puzzle.prototype;

  Proto.init = function(data) {
    var self = this;

    this.loader.on('sprite', function(sx, sy, sprite) {
      self.spritesImgs[sx] || (self.spritesImgs[sx] = {});
      self.spritesImgs[sx][sy] = sprite;
      self.showPieces(sx, sy);
    });

    this.loader.on('sprite:finish', function() {
      self.loader.loadFrame(data);
    });
    
    this.loader.on('covers', function(covers) {
      self.loader.loadSprites(data);
      self.coversImgs = covers;
    });
    this.loader.on('frame', function(frame) {
      self.frame = new ns.Comp.Frame({body: self.$cont, image: frame});
      self.game.getPuzzle(self.data.id);
      self.renderFrame();
    });

    this.data = data;
    this.loader.loadCovers(data);
    
    this.tileSize = ns.Comp.Piece.calcTileSize(data.pieceSize);
    this.stepSize = ns.Comp.Piece.calcStepSize(data.pieceSize);

    this.arrangeCursSize();
    this.arrangeContSize();
    this.arrangeContPos();
  };

  Proto.update = function(data) {
    this.data = data;

    var self = this;

    _.each(this.data.pieces, function(val, i) {
      var x = ~~(i % self.data.lenHor);
      var y = ~~(i / self.data.lenHor);
      var org = ns.Comp.Piece.origin(val);
      var rx = ~~(org % self.data.lenHor);
      var ry = ~~(org / self.data.lenHor);
      var piece = self.pieces[x][y];

      if (piece.rx != rx || piece.ry != ry) {
        piece.rx = rx;
        piece.ry = ry;
        piece.update();
      }

      var selData = self.data.selected[i];

      if (selData) {
        if (selData.my) {
          piece.setSelected(selData);
        } else {
          piece.setBlocked(selData);
        }
      }
    });
  };

  Proto.arrangeCursSize = function() {
    this.$curs.css({
      height : this.tileSize + 2
    , width  : this.tileSize + 2
    });
  };

  Proto.arrangeContSize = function() {
    this.$cont.css({
      height : (this.tileSize + 1) * this.data.lenVer + this.stepSize * 2
    , width  : (this.tileSize + 1) * this.data.lenHor + this.stepSize * 2
    });
  };

  Proto.arrangeContPos = function(animate) {
    var viewW = this.$view.width();
    var viewH = this.$view.height();
    var contW = this.$cont.outerWidth();
    var contH = this.$cont.outerHeight();

    if (!this.contMoved || viewW > contW) {
      this.contDeltaX = (viewW - contW) / 2;
    }
    if (!this.contMoved || viewH > contH) {
      this.contDeltaY = (viewH - contH) / 2;
    }
    if (this.contDeltaX < 0 && this.contDeltaX + contW < viewW) {
      this.contDeltaX = viewW - contW;
    }
    if (this.contDeltaX > 0 && this.contDeltaX + contW > viewW) {
      this.contDeltaX = 0;
    }
    if (this.contDeltaY < 0 && this.contDeltaY + contH < viewH) {
      this.contDeltaY = viewH - contH;
    }
    if (this.contDeltaY > 0 && this.contDeltaY + contH > viewH) {
      this.contDeltaY = 0;
    }

    var coords = {
      x: ~~(this.contDeltaX)
    , y: ~~(this.contDeltaY)
    };

    if (animate) {
      this.$cont.transit(coords);
    } else {
      this.$cont.css(coords);
    }
  };

  Proto.enableDOMEvents = function() {
    var self = this;
    var dragOptions = {
      relative: true
    , distance: 10
    };

    this.$cont.bind('drag', dragOptions, function(e, dd) {
      self.contMoved = true;
      self.$cont.css({
        x: ~~(self.contDeltaX + dd.deltaX)
      , y: ~~(self.contDeltaY + dd.deltaY)
      });
    });

    this.$cont.bind('dragend', function(e, dd) {
      self.contDeltaX += dd.deltaX;
      self.contDeltaY += dd.deltaY;
      self.arrangeContPos(true);
    });

    this.$cont.bind('mousemove', function(e) {
      var piece = self.findPiece(e.clientX, e.clientY);

      if (piece && piece.isActive()) {
        self.$curs.css({
          x: piece.x * (self.tileSize + 1) + self.stepSize - 1
        , y: piece.y * (self.tileSize + 1) + self.stepSize - 1
        });
      }
    });

    this.$cont.bind('click', function(e) {
      var piece = self.findPiece(e.clientX, e.clientY);

      if (self.selected && self.selected !== piece) {
        if (self.selected.shapeKey() == piece.shapeKey()) {
          self.selected.setWaiting();
          piece.setWaiting();
        }
      }
      else if (piece && !piece.isBlocked() && !piece.isSelected()) {
        piece.setWaiting();

        self.game.selectPiece(self.data.id, piece.index, function(data) {
          piece.unsetWaiting();
          piece.setSelected(data);
          self.selected = piece;
        });
      }
      else if (piece && piece.isSelected()) {
        piece.setWaiting();

        self.game.releasePiece(self.data.id, piece.index, function() {
          piece.unsetWaiting();
          piece.unsetSelected();
          self.selected = null;
        });
      }
    });

    $(window).resize(function() {
      self.arrangeContPos();
    });
  };

  Proto.enableGameEvents = function() {
    var self = this;

    this.game.on('puzzle', function(data) {
      if (self.data.id != data.id) {
        self.clear();
        self.init(data);
      } else {
        self.update(data);
      }
    });

    this.game.on('select', function(data) {
      var x = ~~(data.pieceIndex % self.data.lenHor);
      var y = ~~(data.pieceIndex / self.data.lenHor);
      self.pieces[x][y].setBlocked(data);
    });

    this.game.on('release', function(data) {
      var x = ~~(data.pieceIndex % self.data.lenHor);
      var y = ~~(data.pieceIndex / self.data.lenHor);
      self.pieces[x][y].unsetBlocked();
    });
  };


  Proto.clear = function() {
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
    var x1 = sx * this.data.spriteSize;
    var y1 = sy * this.data.spriteSize;
    var x2 = x1 + this.data.spriteSize;
    var y2 = y1 + this.data.spriteSize;
    var self = this;

    // just to speed up appending a bit
    var frag = document.createDocumentFragment()

    _.each(this.data.pieces, function(val, i) {
      var org = ns.Comp.Piece.origin(val);
      var rx = ~~(org % self.data.lenHor);
      var ry = ~~(org / self.data.lenHor);

      if (rx >= x1 && rx < x2 &&
          ry >= y1 && ry < y2) {

        var x = ~~(i % self.data.lenHor);
        var y = ~~(i / self.data.lenHor);
        var piece = new ns.Comp.Piece({
          x: x, y: y
        , rx: rx, ry: ry
        , t: ns.Comp.Piece.earT(val)
        , b: ns.Comp.Piece.earB(val)
        , l: ns.Comp.Piece.earL(val)
        , r: ns.Comp.Piece.earR(val)
        , index: i

        , pieceSize: self.data.pieceSize
        , spriteSize: self.data.spriteSize
        , sprite: self.spritesImgs[sx][sy]
        , covers: self.coversImgs
        });

        self.pieces[x] || (self.pieces[x] = {});
        self.pieces[x][y] = piece;
        frag.appendChild(piece.el);
      }
    });

    this.$cont.append(frag);
  };

  Proto.renderFrame = function() {
    this.frame.render({
      stepSize: this.stepSize
    , tileSize: this.tileSize
    , lenHor: this.data.lenHor
    , lenVer: this.data.lenVer
    , pieces: this.pieces
    });
  };

  ns.Comp.Puzzle = Puzzle;
})();