(function() {
  function Frame(op) {
    this.op = op;
    this.image = op.image;

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('puzzle__frame');
    this.canvas.height = (op.tileSize + 1) * op.lenVer + op.stepSize * 2 + (FRAME_SIZE + 1) * 2;
    this.canvas.width = (op.tileSize + 1) * op.lenHor + op.stepSize * 2 + (FRAME_SIZE + 1) * 2;
    this.canvas.style.left = this.canvas.style.top = -(FRAME_SIZE + 1) + 'px';
  }

  var Proto = Frame.prototype;

  Proto.render = function() {
    var op = this.op;
    var ctx = this.canvas.getContext('2d');
    var frameSize = op.stepSize * 2 + FRAME_SIZE;    
    var et, eb, el, er, dx, dy;

    var dy1 = op.lenVer * (op.tileSize + 1) + FRAME_SIZE + 1;
    var dy2 = 0;

    for (var x = 0; x < op.lenHor; x++) {
      et = op.pieces[x][0].t;
      eb = op.pieces[x][op.lenVer - 1].b;
      
      dx = op.stepSize + x * (op.tileSize + 1) + FRAME_SIZE + 1;

      ctx.drawImage(this.image, 0, eb ? frameSize * 2 : 0,
        op.tileSize, frameSize, dx, dy1, op.tileSize, frameSize);
      ctx.drawImage(this.image, 0, et ? frameSize * 3 : frameSize,
        op.tileSize, frameSize, dx, dy2, op.tileSize, frameSize);
    }

    var dx1 = op.lenHor * (op.tileSize + 1) + FRAME_SIZE + 1;
    var dx2 = 0;

    for (var y = 0; y < op.lenVer; y++) {
      el = op.pieces[0][y].l;
      er = op.pieces[op.lenHor - 1][y].r;
      
      dy = op.stepSize + y * (op.tileSize + 1) + FRAME_SIZE + 1;

      ctx.drawImage(this.image, op.tileSize, er ? op.tileSize : 0,
        frameSize, op.tileSize, dx1, dy, frameSize, op.tileSize);
      ctx.drawImage(this.image, op.tileSize + frameSize, el ? op.tileSize : 0,
        frameSize, op.tileSize, dx2, dy, frameSize, op.tileSize);
    }
  };

  ns.Comp.Frame = Frame;
})();