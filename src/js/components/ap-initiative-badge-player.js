var ApInitiativeBadgePlayer = Vue.extend({
  template: '' +
    '<div id="initiative-badge-{{ entity.id }}" class="eb-v1-badge eb-v1-badge-{{ entity.type }} initiative">' +
      '<div class="row">' +
        '<div class="small-10 columns">' +
          '<div class="clipper">' +
            '<strong>{{ entity.name }}</strong>' +
          '</div>' +
        '</div>' +
        '<div class="small-1 columns text-right">' +
          '<strong>{{ entity.initiative }}</strong>' +
        '</div>' +
        '<div class="small-1 columns">' +
          '<span v-if="parseInt(index) === parseInt(turn)"  class="iconlink added">' +
            '<i class="fa fa-check" style="position: absolute; left: .25em; font-size: 1.6em;"></i>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</div>',

  props: ['index', 'entity', 'turn']

});

Vue.component('ap-initiative-badge-player', ApInitiativeBadgePlayer);
