var ApStore = {
  token: '',
  lastTimestamp: '',
  users: [],
  messages: [],
  user: {
    name: '',
    color: '',
    residentId: '',
    characterId: '',
    campaignId: ''
  },
  inputText: '',
  initiative: {
    timestamp: 0,
    turn: 0,
    round: 0,
    entities: []
  }
};

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

var ApCore = new Vue({
  el: '#ap-core',

  data: ApStore,

  components: {
    'ap-chat-input': ApChatInput,
    'ap-chat-messages': ApChatMessages,
    'ap-dice-bag': ApDiceBag,
    'ap-initiative-gm': ApInitiativeGm,
    'ap-initiative-player': ApInitiativePlayer,
    'ap-online-users': ApOnlineUsers
  },

  ready: function () {
    ApStore.token = token;
  },

  methods: {
    setUser: function (user) {
      ApStore.user.name = user.name;
      ApStore.user.color = user.color;
      ApStore.user.residentId = user.residentId;
      ApStore.user.characterId = user.characterId;
      ApStore.user.campaignId = user.campaignId;
    },
    addMessage: function (message) {
      if (message.timestamp) { this.lastTimestamp = message.timestamp; }

      message.timestamp = message.timestamp || new Date().getTime();
      message.cssClass = 'ap-msg-' + message.type;

      if (message.type === 'private') {
        console.log(message.sender);
        switch (message.sender) {
          case this.user.name:
            message.cssClass += '-me';
            break;
          case 'GM':
            message.cssClass += '-gm';
            break;
          default:
            message.cssClass += '-player';
        }
      }

      message.usercolor = (message.sender === this.user.name) ? '#000' : message.usercolor;
      message.showReply = (message.sender !== this.user.name);
      this.messages.unshift(message);
      if (this.messages.length > 50) {
        this.messages.pop();
      }
    },
    addBuff3r: function (buff3r) {
      for (i in buff3r) {
        buff3r[i].cssClass = 'ap-msg-' + buff3r[i].type;

        if (buff3r[i].type === 'private') {
          switch (buff3r[i].sender) {
            case this.user.name:
              buff3r[i].cssClass += '-me';
              break;
            case 'GM':
              buff3r[i].cssClass += '-gm';
              break;
            default:
              buff3r[i].cssClass += '-player';
          }
        }

        buff3r[i].usercolor = (buff3r[i].sender === this.user.name) ? '#000' : buff3r[i].usercolor;
        buff3r[i].showReply = (buff3r[i].sender !== this.user.name);
        this.messages.unshift(buff3r[i]);
        if (this.messages.length > 50) {
          this.messages.pop();
        }
      }
    },
    loadInitiative: function (initiative) {
      this.initiative = initiative;
    },
    privateMessage: function (user) {
      this.inputText = '/w "' + user + '" ';
      $('#ap-panel-chat-link').click();
      $('#ap-inputText').focus();
    },
    toggleActiveUsers: function () {
      $('.eb-v1-badge-gm').removeClass('active');
      $('.eb-v1-badge-Character').removeClass('active');
      for (user in this.users) {
        if (this.users[user].name === 'GM') {
          $('#badge_gm_' + this.users[user].residentId).addClass('active');
        } else {
          $('#badge_' + this.users[user].characterId).addClass('active');
        }

      }
    },
    // SEND STUFF TO THE SERVER
    sendLogin: function () {
      socket.emit('login', this.token, this.lastTimestamp);
    },
    sendMessage: function (message) {
      message.type = message.recipient ? 'private' : 'public';
      message.sender = this.user.name;
      socket.emit('message', message);
    },
    sendDice: function (message) {
      message.type = 'dice';
      socket.emit('dice', message);
      $('#ap-panel-chat-link').click();
    },
    sendEntities: function () {
      var message = { entities: this.initiative.entities };
      socket.emit('initiative:setEntities', message);
    },
    // INITIATIVE
    addEntity: function (entity) {
      $('#ap-panel-initiative-link').click();
      this.initiative.entities.push(entity);
      this.sendEntities();
    },
    setTurn: function (message) {
      this.initiative.timestamp = message.timestamp;
      this.initiative.turn = message.turn;
      this.initiative.round = message.round;
    },
    setEntities: function (message) {
      this.initiative.timestamp = message.timestamp;
      this.initiative.entities = message.entities;
    },
    removeEntity: function (entity) {
      this.initiative.entities.$remove(entity); // .splice(this.initiative.entities.indexOf(entity), 1);
      this.sendEntities();
    }

  },

  events: {
    'evt-addMessage': function (message) {
      this.addMessage(message);
    },
    'evt-addEntity': function (entity) {
      this.addEntity(entity);
    },
    'evt-privateMessage': function (user) {
      this.privateMessage(user);
    },
    'evt-sendMessage': function (message) {
      this.sendMessage(message);
    },
    'evt-sendDice': function (message) {
      this.sendDice(message);
    },
    'evt-removeEntity': function (entity) {
      this.removeEntity(entity);
    },
    'evt-sendEntities': function () {
      this.sendEntities();
    },
    'evt-toggleActiveUsers': function () {
      this.toggleActiveUsers();
    }
  }
});

var socket = io(ap_sok);

// Socket events
socket.on('connect', function () {
  ApCore.sendLogin();

  // UPDATE TIMESTAMPS
  $('[data-timestamp]').each(function () {
    var local = new moment(new Date($(this).data('timestamp')));
    $(this).text(local.calendar(null, {sameElse: 'MMM Do YYYY'}));
  });
});

socket.on('welcome', function (user) {
  $('.ap-v1-status-gear i').removeClass('fa-ban fa-gear fa-spin');
  $('.ap-v1-status-gear i').addClass('fa-comments');

  ApCore.setUser(user);
  socket.emit('onlineUsers');
});

socket.on('userJoined', function (user) {
  socket.emit('onlineUsers');
});

socket.on('userLeft', function (user) {
  socket.emit('onlineUsers');
});

socket.on('onlineUsers', function (users) {
  ApStore.users = users;
  ApCore.$emit('evt-toggleActiveUsers');
});

socket.on('message', function (message) {
  ApCore.addMessage(message);
});

socket.on('buff3r', function (buff3r) {
  ApCore.addBuff3r(buff3r);
});

socket.on('loadInitiative', function (initiative) {
  initiative.turn = parseInt(initiative.turn, 10) || 0;
  initiative.round = parseInt(initiative.round, 10) || 0;
  initiative.entities = JSON.parse(initiative.entities);
  ApCore.loadInitiative(initiative);
});

socket.on('initiative:setTurn', function (message) {
  ApCore.setTurn(message);
});

socket.on('initiative:setEntities', function (message) {
  ApCore.setEntities(message);
});

socket.on('disconnect', function (data) {
  $('.ap-v1-status-gear i').removeClass('fa-ban');
  $('.ap-v1-status-gear i').removeClass('fa-comments');
  $('.ap-v1-status-gear i').addClass('fa-gear fa-spin');
});

socket.on('expired', function () {
  $('.ap-v1-status-gear i').removeClass('fa-comments');
  $('.ap-v1-status-gear i').removeClass('fa-gear fa-spin');
  $('.ap-v1-status-gear i').addClass('fa-ban');
  new_token(campaign);
});
