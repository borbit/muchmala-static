(function() {
  ns.Comp.Panel = Backbone.View.extend({
    el: '.panel',

    tpl: ns.utils.tpl('tpl_panel_info'),

    events: {
      'click .panel__btn_about': 'showAbout'
    , 'click .panel__btn_boards': 'showBoards'
    , 'click .panel__btn_profile': 'showProfile'
    , 'click .panel__btn_prev': 'prevPuzzle'
    , 'click .panel__btn_next': 'nextPuzzle'
    , 'click .panel__info': 'switchBoard'
    },

    curBoard: 1,

    initialize: function(op) {
      this.game = op.game;
      this.user = op.game.user;
      this.puzzle = op.game.puzzle;

      this.ui = {
        info: this.$el.find('.panel__info')
      , btnPrev: this.$el.find('.panel__btn_prev')
      , btnNext: this.$el.find('.panel__btn_next')
      , btnBoards: this.$el.find('.panel__btn_boards')
      };

      this.render();
      this.listenTo(this.user, 'change', this.render);
      this.listenToOnce(this.game, 'puzzle:load', function() {
        this.show();
      });

      this.listenTo(this.game, 'puzzle:loading', function() {
        this.ui.btnPrev.attr('disabled', true);
        this.ui.btnNext.attr('disabled', true);
      });
      this.listenTo(this.game, 'puzzle:load', function() {
        this.btnReset(this.ui.btnPrev);
        this.btnReset(this.ui.btnNext);
      });
    },

    render: function() {
      var boards = this.user.get('boards');
      var boardName = this.user.boards[this.curBoard];
      var boardData = _.extend({score: 0, rank: 0, next: 0}, boards[boardName]);

      this.ui.info.removeClass();
      this.ui.info.addClass('panel__info');
      this.ui.info.addClass('panel__info_'+boardName);
      this.ui.info.html(this.tpl(boardData));
    },

    showAbout: function() {
      var dialog = new ns.Comp.Dialog({el: $('.about')});
      dialog.open();
    },

    showBoards: function() {
      var self = this;
      var boards = new ns.Comp.Boards({user: this.user});
      var dialog = new ns.Comp.Dialog({content: boards.$el});

      boards.on('render', function() {  
        self.btnReset(self.ui.btnBoards);
        dialog.open();
      });

      this.btnLoading(this.ui.btnBoards);
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

    prevPuzzle: function() {
      this.btnLoading(this.ui.btnPrev);
      this.game.getPrevPuzzle();
    },

    nextPuzzle: function() {
      this.btnLoading(this.ui.btnNext);
      this.game.getNextPuzzle();
    },

    btnLoading: function($btn) {
      $btn.addClass('panel__btn_loading');
      $btn.attr('disabled', true);
    },

    btnReset: function($btn) {
      $btn.removeClass('panel__btn_loading');
      $btn.removeAttr('disabled', true);
    },

    show: function() {
      this.$el.transit({x: 0});
    }
  });
})();