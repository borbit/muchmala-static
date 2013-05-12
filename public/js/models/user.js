ns.Models.User = Backbone.Model.extend({
  urlRoot: sprintf('%s/users', API_URL),

  id: localStorage['userid'],

  defaults: {
    name: ''
  , email: ''
  },

  initialize: function() {
    this.on('change:id', function(model) {
      localStorage['userid'] = model.id;
    });
  }
});