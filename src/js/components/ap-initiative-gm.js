var ApInitiativeGm = Vue.extend({
  template: '' +
    '<div class="row">' +
      '<div class="small-5 columns"><a class="iconlink" v-on:click="updateTurn(-1)"><i class="fa fa-fw fa-minus-circle delete" style="font-size: 1.25em;"></i></a><strong><span style="color: #c5c5c5;">Trn</span> {{ initiative.turn+1 }}</strong> <a class="iconlink add" v-on:click="updateTurn(1)"><i class="fa fa-fw fa-plus-circle" style="font-size: 1.25em;"></i></a></div>' +
      '<div class="small-2 columns text-center"><a class="iconlink" v-on:click="resetInitiative"><i class="fa fa-fw fa-history" title="Reset Initiative" style="font-size: 1.25em;"></i></a></div>' +
      '<div class="small-5 columns text-right"><a class="iconlink" v-on:click="updateRound(-1)"><i class="fa fa-fw fa-minus-circle delete" style="font-size: 1.25em;"></i></a><strong><span style="color: #c5c5c5;">Rnd</span> {{ initiative.round+1 }}</strong><a class="iconlink add" v-on:click="updateRound(1)"><i class="fa fa-fw fa-plus-circle" style="font-size: 1.25em;"></i></a></div>' +
    '</div>' +
    '<ul class="no-bullet">' +
      '<li v-for="(index, entity) in initiative.entities | orderBy \'initiative\' -1">' +
        '<ap-initiative-badge-gm v-bind:entity="entity" v-bind:index="index" v-bind:turn="initiative.turn"></ap-initiative-badge-gm>' +
      '</li>' +
    '</ul>',

  components: {
    'ap-initiative-badge-gm': ApInitiativeBadgeGm
  },

  props: ['initiative'],

  methods: {
    resetInitiative: function (n) {
      this.initiative.turn = 0;
      this.initiative.round = 0;
      for (entity in this.initiative.entities) {
        this.initiative.entities[entity].initiative = 0;
      }
      this.sendTurn();
      this.$broadcast('evt-resetInitiative');
      this.$dispatch('evt-sendEntities');
    },
    cycleTurn: function () {
      if (this.initiative.turn > (this.initiative.entities.length - 1)) {
        this.initiative.turn = 0;
        this.initiative.round++;
      }
      if (this.initiative.turn < 0) {
        (this.initiative.round > 1) ? (this.initiative.turn = (this.initiative.entities.length - 1)) : this.initiative.turn = 0;
        if (this.initiative.round > 0) { this.initiative.round--; }
      }
      this.sendTurn();
    },
    updateTurn: function (n) {
      this.initiative.turn = this.initiative.turn + n;
      this.cycleTurn();
    },
    setTurn: function (index) {
      this.initiative.turn = index;
      this.cycleTurn();
    },
    updateRound: function (n) {
      this.initiative.round = this.initiative.round + n;
      this.initiative.turn = 0;
      if (this.initiative.round < 0) { this.initiative.round = 0; };
      this.sendTurn();
    },
    sendTurn: function () {
      var message = { turn: this.initiative.turn, round: this.initiative.round };
      socket.emit('initiative:setTurn', message);
    }
  },

  events: {
    'evt-setTurn': function (index) {
      this.setTurn(index);
    }
  }
});

Vue.component('ap-initiative-gm', ApInitiativeGm);
