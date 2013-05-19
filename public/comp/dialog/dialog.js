ns.Comp.Dialog = Backbone.View.extend({
  tpl: ns.utils.tpl('tpl_dialog'),

  events: {
    'click .dialog__close': 'close'
  , 'click .dialog__cancel': 'close'
  },
  
  initialize: function(op) {
    _.bindAll(this, 'keyup');    
    _.defaults(op, {
      content: ''
    })

    this.content = op.content;
    this.render();
  },
  
  render: function() {
    this.setElement(this.tpl({content: '<var></var>'}), true);
    this.$el.find('var').replaceWith(this.content);
  },
  
  open: function() {
    document.addEventListener('keyup', this.keyup);
    this.$el.appendTo(document.body);
    this.delegateEvents();
    this.trigger('open');
  },
  
  close: function() {
    document.removeEventListener('keyup', this.keyup);
    this.$el.remove();
    this.trigger('close');
  },
  
  keyup: function(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }
});