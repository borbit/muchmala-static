(function() {
  var requestAnimationFrame = 
     window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame 
  || window.oRequestAnimationFrame 
  || window.msRequestAnimationFrame;

  ns.utils = {
    rand: function(min, max) {
      return Math.floor(min+Math.random() * (max-min));
    },

    inherit: function(Child, Parent) {
      function F() {}
      F.prototype = Parent.prototype;
      Child.prototype = new F();
      Child.prototype.constructor = Child;
    },

    tpl: function(id) {
      return _.template($.trim(document.getElementById(id).innerHTML));
    },

    validateEmail: function(email) {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    },

    requestAnimationFrame: function(cb) {
      return requestAnimationFrame(cb);
    }
  };
})();