ns.Models.User = Backbone.Model.extend({
  urlRoot: sprintf('%s/users', API_URL),

  id: localStorage['userid'],

  defaults: {
    name: ''
  , email: ''
  , boards: {
      general: {
        score: 0
      , rank: 0
      , next: 0
      },
      daily: {
        score: 0
      , rank: 0
      , next: 0
      }
    }
  },

  boards: ['general', 'daily'],

  initialize: function() {
    this.on('change:id', function(model) {
      localStorage['userid'] = model.id;
    });
  }
});