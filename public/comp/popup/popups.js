(function() {
  ns.Popups = {
    mid: function(message, options) {
      return ns.PopupsMid.add(message, options);
    },
    top: function(message, options) {
      return ns.PopupsTop.add(message, options);
    }
  };

  ns.PopupsTop = (function() {
    var body = $('<div class="popups popups_top"/>');
    var processing = false
      , arranging = 0
      , queued = []
      , timer = null
      , shown = [];

    return {
      add: function(message, options) {
        options || (options = {});

        _.extend(options, {
          mes: message
        , body: body
        , pos: 'top'
        });

        var popup = new ns.Popup(options);

        queued.push(popup);

        if (!processing) {
          timer = setInterval(process, 50);
          processing = true;
        }

        return popup;
      }
    };

    function process() {
      if (arranging) return;

      var popup = queued.shift();

      if (!queued.length) {
        clearInterval(timer);
        processing = false;
      }

      popup.render();
      popup.bind('beforeHide', function() {
        arranging++;
      });
      popup.bind('hide', function() {
        shown.splice(shown.indexOf(popup), 1);
        if (!shown.length && !queued.length) {
          removeBody(body);
        }
        arrangePopups(shown, function() {
          arranging--;
        });
      });
      popup.bind('show', function() {
        arranging--;
      });

      shown.unshift(popup);
      arranging++;

      if (shown.length == 1) {
        appendBody(body);
        popup.show();
        return;
      }

      arrangePopups(shown, function() {
        popup.show();
      });
    }
  })();

  ns.PopupsMid = (function() {
    var body = $('<div class="popups popups_mid"/>');
    var processing = false
      , arranging = 0
      , queued = []
      , timer = null
      , shown = [];

    return {
      add: function(message, options) {
        options || (options = {});

        _.extend(options, {
          mes: message
        , body: body
        , pos: 'mid'
        });

        var popup = new ns.Popup(options);

        queued.push(popup);

        if (!processing) {
          timer = setInterval(process, 50);
          processing = true;
        }

        return popup;
      }
    };

    function process() {
      if (arranging) return;

      var popup = queued.shift();

      if (!queued.length) {
        clearInterval(timer);
        processing = false;
      }

      popup.render();
      popup.bind('beforeHide', function() {
        arranging++;
      });
      popup.bind('hide', function() {
        shown.splice(shown.indexOf(popup), 1);
        if (!shown.length && !queued.length) {
          removeBody(body);
        }
        arrangeBody(body, shown);
        arrangePopups(shown, function() {
          arranging--;
        });
      });
      popup.bind('show', function() {
        arranging--;
      });

      shown.unshift(popup);
      arranging++;

      if (shown.length == 1) {
        appendBody(body);
        centerBody(body, shown);
        popup.show();
        return
      }

      arrangeBody(body, shown);
      arrangePopups(shown, function() {
        popup.show();
      });
    }
  })();

  function arrangePopups(popups, cb) {
    if (!popups.length) {
      return cb();
    }
    cb = _.after(popups.length, cb);

    var bottom = 0;
    _.each(popups, function(popup) {
      popup.move(bottom, cb);
      bottom += popup.height();
    });
  }

  function calcBodyHeight(popups) {
    var height = 0;
    for(var i = popups.length; i--;) {
      height += popups[i].height();
    }
    return height;
  }

  function arrangeBody(body, popups) {
    var height;
    if (height = calcBodyHeight(popups)) {
      body.transit({'y': -~~(height/2)});
    }
  }

  function centerBody(body, popups) {
    var height;
    if (height = calcBodyHeight(popups)) {
      body.css({'y': -~~(height/2)})
    }
  }

  function appendBody(body) {
    body.appendTo(document.body);
  }

  function removeBody(body) {
    body.remove();
  }
})();