var ApDiceBag = Vue.extend({
  template: '' +
    '<div class="text-right" style="margin-bottom: .75em; line-height: .5em;">' +
        '<a v-for="dice in die" v-on:click="sendDice(dice)"><span class="secondary square label ap-dice" style="margin-left: .25em; margin-top: .25em; font-weight: bold;">\{{ dice }}</span></a>' +
    '</ul>',

  data: function () {
    return { die: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100', 'FATE'] };
  },

  methods: {
    sendDice: function (dice) {
      dice = (dice === 'FATE') ? 'FATE' : '1' + dice;
      this.$dispatch('evt-sendDice', {text: dice});
    }
  }
});

Vue.component('ap-dice-bag', ApDiceBag);
