(function() {
  ns.Comp.Panel = Backbone.View.extend({
    el: '.panel',

    tpl: ns.utils.tpl('tpl_panel_info'),

    events: {
      'click .panel__btn_about': 'showAbout'
    , 'click .panel__btn_boards': 'showBoards'
    , 'click .panel__btn_profile': 'showProfile'
    , 'click .panel__btn_next': 'nextPuzzle'
    },

    boards: [
      'general'
    , 'daily'
    ],

    curBoard: 1,

    initialize: function(op) {
      this.game = op.game;
      this.user = op.game.user;
      this.listenTo(this.user, 'change', this.render);
      this.render();
    },

    render: function() {
      var boards = this.user.get('boards');
      var board = boards[this.boards[this.curBoard]];
      var html = this.tpl(_.extend({score: 0, rank: 0, next: 0}, board));
      this.$el.find('.panel__info').html(html);
    },

    showAbout: function() {
      var dialog = new ns.Comp.Dialog({
        content: 'test'
      });
      dialog.open();
    }
  });
})();