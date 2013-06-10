ns.Comp.Dialog = Backbone.View.extend({
  tpl: ns.utils.tpl('tpl_dialog'),

  events: {
    'click .dialog__close': 'close'
  , 'click .dialog__cancel': 'close'
  },
  
  initialize: function(op) {
    if (op.el) {
      this.setElement(op.el);
      this.save = true;
    }

    _.bindAll(this, 'keyup');
    this.content = op.content;
    this.render();
  },
  
  render: function() {
    if (_.isString(this.content)) {
      this.setElement(this.tpl({content: this.content}));
      this.delegateEvents();
    }
    if (_.isObject(this.content)) {
      this.setElement(this.tpl({content: '<var></var>'}));
      this.$el.find('var').replaceWith(this.content);
      this.delegateEvents();
    }
    this.$view = this.$el.find('.dialog__view');
  },
  
  open: function() {
    document.addEventListener('keyup', this.keyup);

    this.$el.show();
    this.$el.appendTo(document.body);
    this.$view.css({y: -10});
    this.$view.transit({y: 0}, 200);
    this.$el.transit({opacity: 1}, 200);
    this.delegateEvents();
  },
  
  close: function() {
    document.removeEventListener('keyup', this.keyup);

    var self = this;
    this.$view.transit({y: -10}, 200);
    this.$el.transit({opacity: 0}, 200, function() {
      self.$el.hide();
      self.save || self.$el.remove();
    });
  },

  keyup: function(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }
});