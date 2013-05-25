ns.Comp.Profile = Backbone.View.extend({
  tpl: ns.utils.tpl('tpl_profile'),

  events: {
    'click .profile__save': 'save'
  , 'click .profile__submit': 'submit'
  , 'keyup [name=name]': 'keyupName'
  , 'keyup [name=email]': 'keyupEmail'
  },

  initialize: function(op) {
    this.user = op.user;
    this.render();
  },

  render: function() {
    this.$el.html(this.tpl({
      user: this.user.toJSON()
    }));
    this.delegateEvents();
    this.ui = {
      name   : this.$el.find('[name=name]')
    , email  : this.$el.find('[name=email]')
    , submit : this.$el.find('.profile__submit')
    , save   : this.$el.find('.profile__save')
    };
  },

  save: function() {
    var self = this;
    var name = this.ui.name.val().trim();
    
    this.ui.name.removeClass('dialog__inp_err');

    if (!name) {
      return this.ui.name.addClass('dialog__inp_err');
    }
    
    this.ui.save.append(' ...');
    this.ui.save.attr('disabled', true);

    this.user.save({name: name}, {
      wait: true
    , success: function() {
      self.ui.save.html('Edited successfully');
      self.ui.save.removeAttr('disabled');
    }});
  },

  submit: function() {
    var self = this;
    var email = this.ui.email.val().trim();

    this.ui.email.removeClass('dialog__inp_err');

    if (!ns.utils.validateEmail(email)) {
      return this.ui.email.addClass('dialog__inp_err');
    }

    this.ui.submit.append(' ...');
    this.ui.submit.attr('disabled', true);

    var data = {
      userId: this.user.id
    , userEmail: email
    };

    $.post(sprintf('%s/sign', API_URL), data, function(res) {
      self.ui.submit.html('Check your inbox');
      self.ui.submit.removeAttr('disabled');
    });
  },

  keyupName: function(event) {
    this.ui.save.html('Edit my name');
    if (event.keyCode == 13) {
      this.save();
    }
  },

  keyupEmail: function(event) {
    this.ui.submit.html('Send me link');
    if (event.keyCode == 13) {
      this.submit();
    }
  }
});