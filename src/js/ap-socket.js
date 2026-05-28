import ApStore, { addMessage, addMessages, setInitiative } from './ap-store.js';

function refreshTimestamps() {
  if (typeof window.moment !== 'function') {
    return;
  }

  const timestampElements = document.querySelectorAll('[data-timestamp]');
  timestampElements.forEach(function updateTimestamp(element) {
    const value = element.getAttribute('data-timestamp');
    if (!value) {
      return;
    }

    const local = new window.moment(new Date(value));
    element.textContent = local.calendar(null, { sameElse: 'MMM Do YYYY' });
  });
}

function updateUser(user) {
  ApStore.user = {
    name: user.name || '',
    color: user.color || '',
    residentId: user.residentId || '',
    characterId: user.characterId || '',
    campaignId: user.campaignId || ''
  };

  ApStore.notify('ap:user-updated', { user: ApStore.user });
}

function updateInitiativeEntities(message) {
  const entities = Array.isArray(message.entities) ? message.entities : [];

  ApStore.initiative.timestamp = message.timestamp || Date.now();
  ApStore.initiative.entities = entities;
  ApStore.notify('ap:initiative-updated', { initiative: ApStore.initiative });
}

function updateInitiativeTurn(message) {
  ApStore.initiative.timestamp = message.timestamp || Date.now();
  ApStore.initiative.turn = parseInt(message.turn, 10) || 0;
  ApStore.initiative.round = parseInt(message.round, 10) || 0;

  ApStore.notify('ap:initiative-updated', { initiative: ApStore.initiative });
}

export function initSocket(url) {
  const socketUrl = url || '/activeplay/v0.6';
  const socket = window.io(socketUrl);

  socket.on('connect', function onConnect() {
    ApStore.notify('ap:status-changed', { status: 'connecting' });
    socket.emit('login', ApStore.token, ApStore.lastTimestamp);
    refreshTimestamps();
  });

  socket.on('welcome', function onWelcome(user) {
    updateUser(user || {});
    ApStore.notify('ap:status-changed', { status: 'connected' });
    socket.emit('onlineUsers');
  });

  socket.on('userJoined', function onUserJoined() {
    socket.emit('onlineUsers');
  });

  socket.on('userLeft', function onUserLeft() {
    socket.emit('onlineUsers');
  });

  socket.on('onlineUsers', function onOnlineUsers(users) {
    ApStore.users = Array.isArray(users) ? users : [];
    ApStore.notify('ap:users-updated', { users: ApStore.users });
  });

  socket.on('message', function onMessage(message) {
    addMessage(message);
  });

  socket.on('buff3r', function onBuff3r(buff3r) {
    addMessages(buff3r);
  });

  socket.on('loadInitiative', function onLoadInitiative(initiative) {
    setInitiative(initiative);
  });

  socket.on('initiative:setTurn', function onInitiativeSetTurn(message) {
    updateInitiativeTurn(message || {});
  });

  socket.on('initiative:setEntities', function onInitiativeSetEntities(message) {
    updateInitiativeEntities(message || {});
  });

  socket.on('disconnect', function onDisconnect() {
    ApStore.notify('ap:status-changed', { status: 'disconnected' });
  });

  socket.on('expired', function onExpired() {
    ApStore.notify('ap:status-changed', { status: 'expired' });
    ApStore.notify('ap:token-expired');
  });

  return socket;
}

export default initSocket;
