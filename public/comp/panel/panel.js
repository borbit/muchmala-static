(function() {
  ns.Comp.Panel = Backbone.View.extend({
    el: '.panel',

    tpl: ns.utils.tpl('tpl_panel_info'),

    events: {
      'click .panel__btn_about': 'showAbout'
    , 'click .panel__btn_boards': 'showBoards'
    , 'click .panel__btn_profile': 'showProfile'
    , 'click .panel__btn_next': 'nextPuzzle'
    , 'click .panel__info': 'switchBoard'
    },

    curBoard: 1,

    initialize: function(op) {
      this.game = op.game;
      this.user = op.game.user;
      this.listenTo(this.user, 'change', this.render);
      this.render();
    },

    render: function() {
      var boards = this.user.get('boards');
      var boardName = this.user.boards[this.curBoard];
      var boardData = _.extend({score: 0, rank: 0, next: 0}, boards[boardName]);

      var $info = this.$el.find('.panel__info');      

      $info.removeClass();
      $info.addClass('panel__info');
      $info.addClass('panel__info_'+boardName);
      $info.html(this.tpl(boardData));
    },

    showAbout: function() {
      var dialog = new ns.Comp.Dialog({el: $('.about')});
      dialog.open();
    },

    showBoards: function(e) {
      var boards = new ns.Comp.Boards({user: this.user});
      var dialog = new ns.Comp.Dialog({content: boards.$el});
      boards.on('render', function() {  
        e.target.classList.remove('panel__btn_loading');
        e.target.removeAttribute('disabled');
        dialog.open();
      });
      e.target.classList.add('panel__btn_loading');
      e.target.setAttribute('disabled', true);
      boards.load();
    },

    showProfile: function() {
      var profile = new ns.Comp.Profile({user: this.user});
      var dialog = new ns.Comp.Dialog({content: profile.$el});
      dialog.open();
    },

    switchBoard: function() {
      this.curBoard++;
      this.curBoard >= this.user.boards.length && (this.curBoard = 0);
      this.render();
    },

    nextPuzzle: function(e) {
      var self = this;
      e.target.classList.add('panel__btn_loading');
      e.target.setAttribute('disabled', true);

      $.get(sprintf('%s/rand', API_URL), function(puzzleId) {
        e.target.classList.remove('panel__btn_loading');
        e.target.removeAttribute('disabled');
        Backbone.history.navigate('puzzle/' + puzzleId);
        self.game.getPuzzle(puzzleId);
      });
    }
  });
})();