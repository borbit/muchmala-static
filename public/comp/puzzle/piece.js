(function() {
  function Piece(op) {
    this.index = op.index;

    this.x = op.x;
    this.y = op.y;

    this.rx = op.rx;
    this.ry = op.ry;

    this.t = op.t;
    this.b = op.b;
    this.l = op.l;
    this.r = op.r;
    
    this.covers = op.covers;
    this.sprites = op.sprites;
    this.pieceSize = op.pieceSize;
    this.spriteSize = op.spriteSize;

    this.tileSize = Piece.calcTileSize(this.pieceSize);
    this.stepSize = Piece.calcStepSize(this.pieceSize);

    this.cx = this.x * (this.tileSize + 1);
    this.cy = this.y * (this.tileSize + 1);

    // flags
    this.waiting = false;
    this.selected = false;
    this.blocked = false;

    this.render();
  }

  var Proto = Piece.prototype;

  Proto.render = function() {
    this.el = document.createElement('div');
    this.el.style.height = this.pieceSize + 'px';
    this.el.style.width = this.pieceSize + 'px';
    this.el.style.left = this.cx + 'px';
    this.el.style.top = this.cy + 'px';
    this.el.classList.add('piece');

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('piece__canvas');
    this.canvas.height = this.pieceSize;
    this.canvas.width = this.pieceSize;
    this.draw();

    this.el.appendChild(this.canvas);
    this.updateCover();
  };

  Proto.draw = function() {
    var spriteX = ~~(this.rx / this.spriteSize);
    var spriteY = ~~(this.ry / this.spriteSize);
    var sprite = this.sprites[spriteX][spriteY];

    var sx = this.rx % this.spriteSize * this.pieceSize;
    var sy = this.ry % this.spriteSize * this.pieceSize;
    var ctx = this.canvas.getContext('2d');
    
    ctx.clearRect(0, 0, this.pieceSize, this.pieceSize);
    ctx.drawImage(sprite, sx, sy, this.pieceSize,
      this.pieceSize, 0, 0, this.pieceSize, this.pieceSize);
  };

  Proto.updateCover = function() {
    if (this.x != this.rx || this.y != this.ry) {
      this.showDefCover();
    } else {
      this.removeCover();
    }
  };

  Proto.update = function() {
    this.updateCover();
    this.draw();
  };

  Proto.showTooltip = function(text) {
    this.tooltip = document.createElement('span');
    this.tooltip.innerHTML = sprintf('<i>%s</i>', text);
    this.tooltip.classList.add('piece__tooltip');

    this.tooltip.style.lineHeight = this.pieceSize + 'px';
    this.tooltip.style.height = this.pieceSize + 'px';
    this.tooltip.style.width = this.pieceSize + 'px';
    this.tooltip.style.left = this.cx + 'px';
    this.tooltip.style.top = this.cy + 'px';

    this.el.parentNode.appendChild(this.tooltip);
  };

  Proto.removeTooltip = function() {
    if (!this.tooltip) return;
    this.el.parentNode.removeChild(this.tooltip);
    this.tooltip = null;
  };

  Proto.showScore = function(score) {
    var $el = $('<div class="piece__score">' + score + '</div>');
    
    $el.css({
      'lineHeight' : this.pieceSize + 2 + 'px'
    , 'height'     : this.pieceSize
    , 'width'      : this.pieceSize
    , 'left'       : this.cx
    , 'top'        : this.cy
    });

    var css = {'font-size': 60, opacity: 0};

    $el.appendTo(this.el.parentNode);
    $el.transit(css, 400, 'ease-out', function() {
      $el.remove();
    });
  };

  var COVERS_MAP = {
    '0000': {x: 0, y: 0}
  , '1111': {x: 1, y: 0}
  , '0100': {x: 2, y: 0}
  , '1000': {x: 3, y: 0}
  , '0001': {x: 0, y: 1}
  , '0010': {x: 1, y: 1}
  , '1101': {x: 2, y: 1}
  , '1011': {x: 3, y: 1}
  , '1110': {x: 0, y: 2}
  , '0111': {x: 1, y: 2}
  , '1100': {x: 2, y: 2}
  , '0011': {x: 3, y: 2}
  , '1001': {x: 0, y: 3}
  , '0110': {x: 1, y: 3}
  , '1010': {x: 2, y: 3}
  , '0101': {x: 3, y: 3}
  };

  Proto.addCover = function() {
    this.cover = document.createElement('canvas');
    this.cover.classList.add('piece__cover');
    this.cover.height = this.pieceSize;
    this.cover.width = this.pieceSize;
    this.el.appendChild(this.cover);
  };

  Proto.showCover = function(type) {
    if (!this.cover) this.addCover();

    var ctx = this.cover.getContext('2d');
    var coords = COVERS_MAP[this.shapeKey()];
    var sx = coords.x * this.pieceSize;
    var sy = coords.y * this.pieceSize;
    
    ctx.clearRect(0, 0, this.pieceSize, this.pieceSize);
    ctx.drawImage(this.covers[type], sx, sy, this.pieceSize,
      this.pieceSize, 0, 0, this.pieceSize, this.pieceSize);
  };

  Proto.removeCover = function() {
    if (this.cover) {
      this.el.removeChild(this.cover);
      this.cover = null;
    }
  };

  Proto.showDefCover = function() {
    this.showCover('def');
  };

  Proto.showSelCover = function() {
    this.showCover('sel');
  };
  
  Proto.showLocCover = function() {
    this.showCover('loc');
  };

  Proto.shapeKey = function() {
    return (this.t ? '1' : '0')
         + (this.l ? '1' : '0')
         + (this.b ? '1' : '0')
         + (this.r ? '1' : '0');
  };

  Proto.hasPoint = function(ex, ey) {
    var s = this.stepSize;
    var x = this.cx;
    var y = this.cy;

    if((ex >= x+s     && ey >= y+s     && ex <= x+s*2.5 && ey <= y+s*2.5) ||
       (ex >= x+s*3.5 && ey >= y+s     && ex <= x+s*5   && ey <= y+s*2.5) ||
       (ex >= x+s     && ey >= y+s*3.5 && ex <= x+s*2.5 && ey <= y+s*5) ||
       (ex >= x+s*3.5 && ey >= y+s*3.5 && ex <= x+s*5   && ey <= y+s*5) ||
       (ex >= x+s*2   && ey >= y+s*2   && ex <= x+s*4   && ey <= y+s*4) ||
       (this.l && ex >= x       && ey >= y+s*2.5 && ex <= x+s*2   && ey <= y+s*3.5) ||
       (this.b && ex >= x+s*2.5 && ey >= y+s*4   && ex <= x+s*3.5 && ey <= y+s*6) ||
       (this.r && ex >= x+s*4   && ey >= y+s*2.5 && ex <= x+s*6   && ey <= y+s*3.5) ||
       (this.t && ex >= x+s*2.5 && ey >= y       && ex <= x+s*3.5 && ey <= y+s*2)) {
        return true;
    }
    return false;
  };

  Proto.isActive = function() {
    return !!!(this.x == this.rx && this.y == this.ry);
  };

  Proto.isSelected = function() {
    return this.selected;
  };

  Proto.isBlocked = function() {
    return this.blocked;
  };

  Proto.setWaiting = function() {
    if (this.waiting) return;
    this.spinner = document.createElement('div');
    this.spinner.classList.add('piece__spinner');
    this.el.appendChild(this.spinner);
    this.waiting = true;
  };

  Proto.unsetWaiting = function() {
    if (!this.waiting) return;
    this.el.removeChild(this.spinner);
    this.waiting = false;
  };

  Proto.setSelected = function() {
    if (this.waiting) return;
    this.showSelCover();
    this.selected = true;
    this.cursor = this.addCursor();
  };

  Proto.unsetSelected = function() {
    if (this.waiting) return;
    if (this.cursor) {
      this.cursor.remove();
      this.cursor = null;
    }
    this.updateCover();
    this.selected = false;
  };

  Proto.setBlocked = function(data) {
    if (this.waiting) return;
    if (data.userName) {
      this.showTooltip(data.userName)
    }
    this.showLocCover();
    this.blocked = true;
    this.cursor = this.addCursor();
  };

  Proto.unsetBlocked = function() {
    if (this.cursor) {
      this.cursor.remove();
      this.cursor = null;
    }
    this.updateCover();
    this.removeTooltip();
    this.blocked = false;
  };

  Proto.clear = function() {
    this.unsetWaiting();
    this.unsetSelected();
    this.unsetBlocked();
  };

  Proto.addCursor = function(color) {
    var cursor = new ns.Comp.Cursor({
      color: color
    , tileSize: this.tileSize
    , stepSize: this.stepSize
    , body: this.el.parentNode
    });
    cursor.show();
    cursor.move(this.x, this.y);
    return cursor;
  };

  Proto.pulse = function() {
    var cursor = this.addCursor('red');
    cursor.pulse(function() {
      cursor.remove();
    });
  };

  Piece.calcStepSize = function(pieceSize) {
    return ~~(pieceSize / 6);
  };

  Piece.calcTileSize = function(pieceSize) {
    return ~~(pieceSize / 6) * 4;
  };

  Piece.origin = function(value) {
    return value >> 4;
  };

  var EAR_T_VAL = 1  // 0001
    , EAR_L_VAL = 2  // 0010
    , EAR_B_VAL = 4  // 0100
    , EAR_R_VAL = 8; // 1000

  var EAR_T_MASK = 1  // 0001
    , EAR_L_MASK = 2  // 0010
    , EAR_B_MASK = 4  // 0100
    , EAR_R_MASK = 8; // 1000

  Piece.earT = function(value) {
    return (value & EAR_T_MASK) == EAR_T_VAL;
  };

  Piece.earL = function(value) {
    return (value & EAR_L_MASK) == EAR_L_VAL;
  };

  Piece.earB = function(value) {
    return (value & EAR_B_MASK) == EAR_B_VAL;
  };

  Piece.earR = function(value) {
    return (value & EAR_R_MASK) == EAR_R_VAL;
  };

  ns.Comp.Piece = Piece;
})();