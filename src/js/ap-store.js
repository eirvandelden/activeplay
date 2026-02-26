const ApStore = {
  token: '',
  testToken: '',
  campaignId: '',
  socketUrl: '/activeplay/v0.6',
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

ApStore.notify = function notify(eventName, detail) {
  const payload = detail || {};
  document.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
};

function toNumber(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function decorateMessage(message) {
  const nextMessage = Object.assign({}, message);

  if (nextMessage.timestamp) {
    ApStore.lastTimestamp = nextMessage.timestamp;
  }

  nextMessage.timestamp = nextMessage.timestamp || Date.now();
  nextMessage.cssClass = 'ap-msg-' + (nextMessage.type || 'system');

  if (nextMessage.type === 'private') {
    if (nextMessage.sender === ApStore.user.name) {
      nextMessage.cssClass += '-me';
    } else if (nextMessage.sender === 'GM') {
      nextMessage.cssClass += '-gm';
    } else {
      nextMessage.cssClass += '-player';
    }
  }

  nextMessage.usercolor = nextMessage.sender === ApStore.user.name ? '#000' : nextMessage.usercolor;
  nextMessage.showReply = Boolean(nextMessage.sender && nextMessage.sender !== ApStore.user.name);

  return nextMessage;
}

export function addMessage(message) {
  const nextMessage = decorateMessage(message || {});
  ApStore.messages.unshift(nextMessage);

  if (ApStore.messages.length > 50) {
    ApStore.messages.pop();
  }

  ApStore.notify('ap:messages-updated', { messages: ApStore.messages });
}

export function addMessages(messages) {
  const sourceMessages = Array.isArray(messages) ? messages : [];
  sourceMessages.forEach(function eachMessage(message) {
    addMessage(message);
  });
}

export function setInitiative(initiative) {
  const nextInitiative = initiative || {};
  let entities = nextInitiative.entities;

  if (typeof entities === 'string') {
    try {
      entities = JSON.parse(entities);
    } catch (_error) {
      entities = [];
    }
  }

  ApStore.initiative = {
    timestamp: toNumber(nextInitiative.timestamp, ApStore.initiative.timestamp || 0),
    turn: toNumber(nextInitiative.turn, 0),
    round: toNumber(nextInitiative.round, 0),
    entities: Array.isArray(entities) ? entities : []
  };

  ApStore.notify('ap:initiative-updated', { initiative: ApStore.initiative });
}

export default ApStore;
