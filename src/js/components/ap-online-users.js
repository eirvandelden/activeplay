var ApOnlineUsers = Vue.extend({
  template: '' +
    '<ul class="no-bullet">' +
      '<li v-for="user in users" transition="staggered" stagger="300">' +
        '<a v-on:click="privateMessage(user.name)">' +
        '<i class="fa fa-paper-plane"></i> \{{ user.name }}</a>' +
      '</li>' +
    '</ul>',

  props: ['users'],

  methods: {
    privateMessage: function (user) {
      this.$dispatch('evt-privateMessage', user);
    }
  }
});

Vue.component('ap-online-users', ApOnlineUsers);
