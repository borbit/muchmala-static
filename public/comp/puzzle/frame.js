(function() {
  function Frame(op) {
    this.$body = op.body;
    this.image = op.image;
    // just an empty canvas to clone
    this.base = document.createElement('canvas');
    this.base.classList.add('puzzle__frame');
  }

  var Proto = Frame.prototype;

  Proto.render = function(op) {
    var frag = document.createDocumentFragment();
    var frameSize = op.stepSize * 2 + FRAME_SIZE;    
    var ft, fb, fl, fr, et, eb, el, er;

    for (var x = 0; x < op.lenHor; x++) {
      ft = this.base.cloneNode();
      fb = this.base.cloneNode();
      
      et = op.pieces[x][0].t;
      eb = op.pieces[x][op.lenVer - 1].b;
      
      ft.style.left = 
      fb.style.left = op.stepSize + x * (op.tileSize + 1) + 'px';
      fb.style.top = op.lenVer * (op.tileSize + 1) + 'px';
      ft.style.top = -FRAME_SIZE - 1 + 'px';

      ft.width = fb.width = op.tileSize;
      ft.height = fb.height = frameSize;
      
      this.drawPiece(ft, 0, et ? frameSize * 3 : frameSize);
      this.drawPiece(fb, 0, eb ? frameSize * 2 : 0);

      frag.appendChild(ft);
      frag.appendChild(fb);
    }

    for (var y = 0; y < op.lenVer; y++) {
      fl = this.base.cloneNode();
      fr = this.base.cloneNode();
      
      el = op.pieces[0][y].l;
      er = op.pieces[op.lenHor - 1][y].r;
      
      fl.style.top = 
      fr.style.top = op.stepSize + y * (op.tileSize + 1) + 'px';
      fr.style.left = op.lenHor * (op.tileSize + 1) + 'px';
      fl.style.left = -FRAME_SIZE - 1 + 'px';

      fl.width = fr.width = frameSize;
      fl.height = fr.height = op.tileSize;
      
      this.drawPiece(fl, op.tileSize + frameSize, el ? op.tileSize : 0);
      this.drawPiece(fr, op.tileSize, er ? op.tileSize : 0);

      frag.appendChild(fl);
      frag.appendChild(fr);
    }
  
    this.$body.append(frag);
  };

  Proto.drawPiece = function(canvas, sx, sy) {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.image, sx, sy, canvas.width, canvas.height,
      0, 0, canvas.width, canvas.height);
  };

  ns.Comp.Frame = Frame;
})();