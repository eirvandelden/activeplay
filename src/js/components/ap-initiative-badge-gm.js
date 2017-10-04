var ApInitiativeBadgeGm = Vue.extend({
  template: '' +
    '<div id="initiative-badge-{{ entity.id }}" class="eb-v1-badge eb-v1-badge-{{ entity.type }} initiative">' +
      '<div class="row">' +
        '<div class="small-1 columns">' +
          '<span style="margin-top: .6em; float: left; color: #c5c5c5">' +
            '<a class="iconlink add" v-bind:class="{ \'added\': parseInt(index) === parseInt(turn) }" v-on:click="setTurn(index)"><i class="fa fa-chevron-right" style="font-size: 1.5em;"></i></a>' +
          '</span>' +
        '</div>' +
        '<div class="small-8 columns">' +
          '<div class="eb-v1-badge-over eb-v1-badge-reduced clipper">' +
            '<span class="eb-v1-badge-name">' +
              '{{ entity.name }}' +
            '</span>' +
          '</div>' +
          '<div class="eb-v1-badge-under clipper">{{ entity.residentName }}</div>' +
        '</div>' +
        '<div class="small-2 columns">' +
          '<div class="eb-v1-badge-over eb-v1-badge-reduced clipper">' +
            '<input type="text" max="99" v-model="initiative" v-on:blur="onBlur" v-on:keypress="onKeyPress" class="eb-v1-card-input" style="margin-bottom: -1px !important; font-weight: bold;">' +
          '</div>' +
          '<div class="eb-v1-badge-under clipper text-center"><i class="fa fa-clock-o"></i> Init</div>' +
        '</div>' +
        '<div class="small-1 columns">' +
          '<span style="margin-top: .6em; float: right;">' +
            '<a v-on:click="removeEntity(entity)" style="width: 2em; display:inline-block; text-align: right;" class="iconlink delete"><i class="fa fa-times-circle" style="font-size: 1.5em;"></i></a>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</div>',

  props: ['index', 'entity', 'turn'],

  data: function () {
    return {
      initiative: 0
    };
  },

  ready: function () {
    this.initiative = this.entity.initiative;
  },

  methods: {
    onKeyPress: function (event) {
      if (event.keyCode === 13) {
        this.onBlur();
      }
      if (this.initiative.length > 1) {
        this.initiative = this.initiative.slice(0, 1);
      }
    },
    onBlur: function () {
      this.initiative = parseInt(this.initiative, 10);
      if (!this.initiative) { this.initiative = 0; };
      this.entity.initiative = parseInt(this.initiative, 10);
      this.$dispatch('evt-sendEntities');
    },
    setTurn: function (index) {
      this.$dispatch('evt-setTurn', index);
    },
    removeEntity: function (entity) {
      this.$dispatch('evt-removeEntity', entity);
    }
  },

  events: {
    'evt-resetInitiative': function (message) {
      this.initiative = 0;
    }
  }
});

Vue.component('ap-initiative-badge-gm', ApInitiativeBadgeGm);
