(function() {
  ns.detect = {
    webp: false
  };
  // detecting webp support
  // https://github.com/Modernizr/Modernizr
  (function() {
    var image = new Image();
    image.onerror = function() {
      ns.detect.webp = false;
    };
    image.onload = function() {
      ns.detect.webp = image.width == 1;
    };
    image.src = 'data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAUAgCdASoBAAEAL/3+/3+CAB/AAAFzrNsAAP5QAAAAAA==';
  })();
})();