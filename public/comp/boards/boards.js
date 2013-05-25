ns.Comp.Boards = Backbone.View.extend({
  tpl: ns.utils.tpl('tpl_boards'),

  events: {
    'click .boards__tab_daily': 'showDaily'
  , 'click .boards__tab_general': 'showGeneral'
  },

  className: 'boards',

  initialize: function(op) {
    this.general = new Backbone.Collection();
    this.daily   = new Backbone.Collection();

    var url = '%s/board/%s/%s';
    this.general.url = sprintf(url, API_URL, 'general', op.user.id);
    this.daily.url   = sprintf(url, API_URL, 'daily', op.user.id);
  },

  load: function() {
    var cb = _.after(2, function() {
      this.render();
    });

    this.listenToOnce(this.general, 'sync', cb);
    this.listenToOnce(this.daily, 'sync', cb);

    this.general.fetch();
    this.daily.fetch();
  },

  render: function() {
    var boards = {
      daily   : this.daily.toJSON()
    , general : this.general.toJSON()
    };

    console.log(boards);

    this.$el.html(this.tpl({boards: boards}));
    this.delegateEvents();
    this.showDaily();

    this.trigger('render');
  },

  showDaily: function() {
    this.switchBoard('daily');
  },

  showGeneral: function() {
    this.switchBoard('general');
  },

  switchBoard: function(name) {
    this.$el.find('.boards__tab').removeClass('boards__tab_act');
    this.$el.find('.boards__tab_' + name).addClass('boards__tab_act');
    this.$el.find('.boards__view').hide();
    this.$el.find('.boards__view_' + name).show();
  }
});
