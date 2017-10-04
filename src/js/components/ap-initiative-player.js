var ApInitiativePlayer = Vue.extend({
  template: '' +
  '<div class="row">' +
    '<div class="small-6 columns"><strong><span style="color: #c5c5c5;">Turn</span> {{ initiative.turn+1 }}</strong></div>' +
    '<div class="small-6 columns text-right"><strong><span style="color: #c5c5c5;">Round</span> {{ initiative.round+1 }}</strong></div>' +
  '</div>' +
    '<ul class="no-bullet">' +
      '<li v-for="(index, entity) in initiative.entities | orderBy \'initiative\' -1">' +
        '<ap-initiative-badge-player v-bind:entity="entity" v-bind:isgm="isgm" v-bind:index="index" v-bind:turn="initiative.turn"></ap-initiative-badge>' +
      '</li>' +
    '</ul>',

  components: {
    'ap-initiative-badge-player': ApInitiativeBadgePlayer
  },

  props: ['initiative']

});

Vue.component('ap-initiative-player', ApInitiativePlayer);
