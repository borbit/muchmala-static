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
  },
  
  open: function() {
    document.addEventListener('keyup', this.keyup);
    this.$el.show();
    this.$el.appendTo(document.body);
    this.delegateEvents();
  },
  
  close: function() {
    document.removeEventListener('keyup', this.keyup);
    this.$el.hide();
    if (!this.save) {
      this.$el.remove();
    }
  },
  
  keyup: function(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }
});