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
