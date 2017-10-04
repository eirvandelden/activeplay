var ApChatMessages = Vue.extend({
  template: '' +
    '<ul class="no-bullet">' +
      '<li v-for="message in messages">' +
        '<div style="word-wrap: break-word;">' +
        // TIMESTAMP
          '<span v-show="message.timestamp" class="ap-timestamp" data-timestamp="{{ message.timestamp }}">' +
            ' {{ timestamp_formated(message.timestamp) }} ' +
          '</span>' +
        // SENDER
          '<strong v-show="message.sender" style="color: {{ message.usercolor }};">' +
            '{{ message.sender }}' +
          '</strong>' +
        // RECIPIENT
          '<strong v-show="message.recipient" style="color: #c5c5c5;">' +
            ' <i class="fa fa-chevron-right"></i> ' +
            ' {{ message.recipient }} ' +
            '<a v-show="message.showReply" v-on:click="privateMessage(message.sender)"><i class="fa fa-reply"></i></a>' +
          '</strong> ' +
        '</div>' +
        '<div class="ap-msg">' +
        // TEXT MESSAGE
          '<div v-show="message.text" v-bind:class="message.cssClass">{{ message.text }}</div>' +
        // HTML MESSAGE
          '<div v-show="message.html" v-bind:class="message.cssClass">{{{ message.html }}}</div>' +
        '</div>' +
      '</li>' +
    '</ul>',

  props: ['messages'],

  methods: {
    timestamp_formated: function (timestamp) {
      var local = new moment(new Date(timestamp));
      return local.calendar(null, {sameElse: 'MMM Do YYYY'});
    },
    privateMessage: function (user) {
      this.$dispatch('evt-privateMessage', user);
    },
    timestamp: function (ts) {
      return new Date(ts).toLocaleTimeString();
    }
  }
});

Vue.component('ap-chat-messages', ApChatMessages);
