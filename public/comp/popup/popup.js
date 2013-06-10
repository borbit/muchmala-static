ns.Popup = Backbone.View.extend({
  tpl: ns.utils.tpl('tpl_popup'),

  events: {
    'click .popup__close': 'hide'
  },

  defaults: {
    time: 0
  , mes: ''
  },

  className: 'popup',

  initialize: function(options) {
    _.bindAll(this, 'hide');
    this.options = _.defaults(options, this.defaults);
    this.showing = false;
    this.hidding = false;
  },

  render: function() {
    this.$el.html(this.tpl(this.options));
    this.$el.appendTo(this.options.body);
    this.delegateEvents();
  },

  show: function() {
    var self = this;
    self.trigger('beforeShow');
    self.showing = true;
    self.$el.css({'y': -10});
    self.$el.transit({'y': 0, 'opacity': 1}, function() {
      self.options.time && setTimeout(self.hide, self.options.time);
      self.trigger('show');
    });
  },

  hide: function() {
    var self = this;
    self.trigger('beforeHide');
    self.hidding = true;
    self.$el.transit({y: '-=10', 'opacity': 0}, function() {
      self.hidding = false;
      self.trigger('hide');
      self.$el.remove();
    });
  },

  move: function(top, callback) {
    this.hidding && callback();
    this.$el.transit({y: top}, callback);
  },

  height: function() {
    return this.$el.outerHeight();
  }
});