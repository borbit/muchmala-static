(function() {
  'use strict'

  function Puzzle(op) {
    this.game = op.game;
    
    this.data = {};
    this.pieces = {};
    this.timers = {};
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

    this.clear();
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
      var c = self.getPieceCoords(i);
      var rc = self.getPieceRCoords(val);
      var piece = self.pieces[c.x][c.y];

      if (piece.rx != rc.x || piece.ry != rc.y) {
        piece.rx = rc.x;
        piece.ry = rc.y;
        piece.update();
      }
      
      piece.clear();

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

      if (!piece || !piece.isActive()) return;
      if (self.selected && self.selected !== piece) {
        if (self.selected.shapeKey() == piece.shapeKey()) {
          var selec = self.selected;
          var piece1Index = selec.index;
          var piece2Index = piece.index;

          selec.setWaiting();
          piece.setWaiting();

          self.game.swapPieces(self.data.id, piece1Index, piece2Index, function(data) {
            self.swapPieces(data.pieces);
            self.selected = null;
          });
        }
      }
      else if (!piece.isBlocked() && !piece.isSelected()) {
        piece.setWaiting();
        self.game.selectPiece(self.data.id, piece.index, function(data) {
          self.selectPiece(piece, data);
        });
      }
      else if (piece.isSelected()) {
        piece.setWaiting();
        self.game.releasePiece(self.data.id, piece.index, function() {
          self.releasePiece(piece);
        });
      }
    });

    this.$cont.bind('contextmenu', function(e) {
      if (self.selected) {
        self.selected.setWaiting();
        self.game.releasePiece(self.data.id, self.selected.index, function() {
          self.releasePiece(self.selected);
        });
      }
      e.preventDefault();
      return false;
    });

    $(window).resize(function() {
      self.arrangeContPos();
    });
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


  Proto.clear = function() {
  };

  Proto.selectPiece = function(piece, data) {
    piece.unsetWaiting();
    piece.setSelected(data);
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
    this.selected = null;
  };

  Proto.blockPiece = function(piece, data) {
    piece.unsetWaiting();
    piece.setBlocked(data);

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
      var rc = self.getPieceRCoords(val);

      if (rc.x >= x1 && rc.x < x2 &&
          rc.y >= y1 && rc.y < y2) {

        var c = self.getPieceCoords(i);
        var piece = new ns.Comp.Piece({
          x: c.x, y: c.y
        , rx: rc.x, ry: rc.y
        , t: ns.Comp.Piece.earT(val)
        , b: ns.Comp.Piece.earB(val)
        , l: ns.Comp.Piece.earL(val)
        , r: ns.Comp.Piece.earR(val)
        , index: i

        , pieceSize: self.data.pieceSize
        , spriteSize: self.data.spriteSize
        , sprites: self.spritesImgs
        , covers: self.coversImgs
        });

        self.pieces[c.x] || (self.pieces[c.x] = {});
        self.pieces[c.x][c.y] = piece;
        frag.appendChild(piece.el);
      }
    });

    this.$cont.append(frag);
  };

  Proto.swapPieces = function(pieces) {
    var self = this;
    _.each(pieces, function(val, i) {
      var c = self.getPieceCoords(i);
      var rc = self.getPieceRCoords(val);
      var piece = self.pieces[c.x][c.y];

      piece.rx = rc.x;
      piece.ry = rc.y;

      if (self.timers[piece.x] && self.timers[piece.x][piece.y]) {
        clearTimeout(self.timers[piece.x][piece.y]);
        delete self.timers[piece.x][piece.y];
      }
    
      piece.update();
      piece.clear();
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