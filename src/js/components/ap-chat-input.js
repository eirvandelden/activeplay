var ApChatInput = Vue.extend({
  template: '<input type="text" v-model="inputText" id="ap-inputText" autocomplete="off" autocorrect="off" autocapitalize="off" maxlength="500" style="margin-bottom: 0px;" placeholder="Type here..." v-on:keyup.13="processMessage">',

  data: function () {
    return {
      REGEX_NAME: /(^"(?:\\?.)*?")|(^\w*)/i,
      REGEX_WHISPER: /(^\/w )|(^\/pm )|(^\/whisper )/i,
      REGEX_ROLL: /(^\/r )|(^\/roll )/i,
      REGEX_GMROLL: /(^\/gmr )|(^\/gmroll )/i,
      REGEX_HELP: /(^\/help)|(^\/\?)/i,
      helpText: [
        '/r <span style="color: #4e74a5">or</span> /roll <span style="color: #4e74a5">ndx+b</span>',
        '/r <span style="color: #4e74a5">or</span> /roll <span style="color: #4e74a5">name ndn+b</span>',
        '/r <span style="color: #4e74a5">or</span> /roll "<span style="color: #4e74a5">name with space(s)</span>" <span style="color: #4e74a5">ndn+b</span>',
        '/gmr <span style="color: #4e74a5">or</span> /gmroll send dice roll to GM',
        '/w <span style="color: #4e74a5">or</span> /pm <span style="color: #4e74a5">or</span> /whisper "<span style="color: #4e74a5">recipient</span>" <span style="color: #4e74a5">message</span>',
        '/help <span style="color: #4e74a5">or</span> /?'
      ]
    };
  },

  props: ['inputText'],

  methods: {
    processMessage: function () {
      if (this.inputText) {
        var input = this.inputText.toString();
        input = $('<div/>').html(input).text();
        var message = { text: input, timestamp: new Date() };

        // PRIVATE MESSAGE - /w /pm /whisper
        if (this.REGEX_WHISPER.test(this.inputText)) {
          message.text = this.inputText.replace(this.REGEX_WHISPER, '');
          message.recipient = this.getRecipient(message.text);
          message.recipientId = this.getRecipientId(message.recipient);
          if (message.recipientId) {
            message.text = message.text.replace(message.recipient, '').replace('""', '').trim();
            this.$dispatch('evt-sendMessage', message);
          } else {
            message.text = message.recipient + ' is not online.';
            message.recipient = null;
            message.type = 'system';
            this.$dispatch('evt-addMessage', message);
          }

        // ROLL DICE - /r /roll
        } else if (this.REGEX_ROLL.test(this.inputText)) {
          message.text = this.inputText.replace(this.REGEX_ROLL, '');
          this.$dispatch('evt-sendDice', message);

        // ROLL GM DICE - /gmr /gmroll
        } else if (this.REGEX_GMROLL.test(this.inputText)) {
          message.text = this.inputText.replace(this.REGEX_GMROLL, '');
          message.recipient = 'GM';
          message.recipientId = this.getRecipientId('GM');
          if (message.recipientId) {
            this.$dispatch('evt-sendDice', message);
          } else {
            message.text = message.recipient + ' is not online.';
            message.recipient = null;
            message.type = 'system';
            this.$dispatch('evt-addMessage', message);
          }

        // HELP - /help /?
        } else if (this.REGEX_HELP.test(this.inputText)) {
          message.text = null;
          message.html = '<strong>Commands</strong><ul><li>' + this.helpText.join('</li><li>') + '</li></ul>';
          this.$dispatch('evt-addMessage', message);

        } else {
          this.$dispatch('evt-sendMessage', message);
        }
        this.inputText = '';
      }
    },
    getRecipient: function (data) {
      var regMatch = data.match(this.REGEX_NAME);
      return regMatch[0].replace(/["]/g, '');
    },
    getRecipientId: function (name) {
      var users = this.$parent.users;
      var residentId;

      for (u in users) {
        if (users[u].name.toLowerCase() === name.toLowerCase()) {
          residentId = users[u].residentId;
        }
      }
      if (residentId) {
        return residentId;
      } else {
        return null;
      }
    }
  }
});

Vue.component('ap-chat-input', ApChatInput);
