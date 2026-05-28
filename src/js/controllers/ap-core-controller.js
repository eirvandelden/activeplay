import { Controller } from '@hotwired/stimulus';

import ApStore, { addMessage } from '../ap-store.js';
import { initSocket } from '../ap-socket.js';
import { disconnectSocket } from '../socket-lifecycle.mjs';

function ensureMessageType(message) {
  const nextMessage = Object.assign({}, message || {});
  if (!nextMessage.type) {
    nextMessage.type = 'system';
  }
  return nextMessage;
}

export default class extends Controller {
  static values = {
    token: String,
    testToken: String,
    campaignId: String,
    socketUrl: String
  };

  static targets = ['statusIcon', 'userName'];

  connect() {
    ApStore.token = this.tokenValue || '';
    ApStore.testToken = this.testTokenValue || '';
    ApStore.campaignId = this.campaignIdValue || '';
    ApStore.socketUrl = this.socketUrlValue || '/activeplay/v0.6';

    this.onStatusChanged = this.onStatusChanged.bind(this);
    this.onUserUpdated = this.onUserUpdated.bind(this);
    this.onTokenExpired = this.onTokenExpired.bind(this);
    this.onPrivateMessageRequested = this.onPrivateMessageRequested.bind(this);

    document.addEventListener('ap:status-changed', this.onStatusChanged);
    document.addEventListener('ap:user-updated', this.onUserUpdated);
    document.addEventListener('ap:token-expired', this.onTokenExpired);
    document.addEventListener('ap:private-message-requested', this.onPrivateMessageRequested);

    this.socket = initSocket(ApStore.socketUrl);
    window._apSocket = this.socket;
    this.updateStatusIcon('connecting');
    this.updateUserName(ApStore.user.name);
  }

  disconnect() {
    document.removeEventListener('ap:status-changed', this.onStatusChanged);
    document.removeEventListener('ap:user-updated', this.onUserUpdated);
    document.removeEventListener('ap:token-expired', this.onTokenExpired);
    document.removeEventListener('ap:private-message-requested', this.onPrivateMessageRequested);

    if (window._apSocket === this.socket) {
      delete window._apSocket;
    }

    disconnectSocket(this.socket);
    this.socket = null;
  }

  sendMessage(event) {
    if (!this.socket) {
      return;
    }

    const message = Object.assign({}, event.detail || {});
    message.type = message.recipient ? 'private' : 'public';
    message.sender = ApStore.user.name;
    this.socket.emit('message', message);
  }

  sendDice(event) {
    if (!this.socket) {
      return;
    }

    const message = Object.assign({}, event.detail || {});
    message.type = 'dice';
    this.socket.emit('dice', message);
    this.switchTab('ap-panel-chat');
  }

  addMessage(event) {
    const message = ensureMessageType(event.detail || {});
    addMessage(message);
  }

  privateMessage(event) {
    const detail = event.detail || {};
    this.prefillPrivateMessage(detail.userName);
  }

  onStatusChanged(event) {
    const detail = event.detail || {};
    this.updateStatusIcon(detail.status || 'disconnected');
  }

  onUserUpdated(event) {
    const detail = event.detail || {};
    const user = detail.user || {};
    this.updateUserName(user.name || '');
  }

  onTokenExpired() {
    if (ApStore.token === ApStore.testToken || !this.socket) {
      return;
    }

    ApStore.token = ApStore.testToken;
    this.socket.emit('login', ApStore.token, ApStore.lastTimestamp);
  }

  onPrivateMessageRequested(event) {
    const detail = event.detail || {};
    this.prefillPrivateMessage(detail.userName);
  }

  prefillPrivateMessage(userName) {
    if (!userName) {
      return;
    }

    ApStore.inputText = '/w "' + userName + '" ';
    this.switchTab('ap-panel-chat');
    ApStore.notify('ap:focus-input');
  }

  switchTab(panelId) {
    const tabsElement = this.element.querySelector('[data-ap-tabs-name="chat"]');
    if (!tabsElement) {
      return;
    }

    tabsElement.dispatchEvent(new CustomEvent('ap:switch-tab', {
      bubbles: true,
      detail: { panelId: panelId }
    }));
  }

  updateUserName(name) {
    if (!this.hasUserNameTarget) {
      return;
    }

    this.userNameTarget.textContent = name || '';
  }

  updateStatusIcon(status) {
    if (!this.hasStatusIconTarget) {
      return;
    }

    const icon = this.statusIconTarget;
    icon.classList.remove('fa-ban', 'fa-comments', 'fa-gear', 'fa-spin');

    if (status === 'connected') {
      icon.classList.add('fa-comments');
      return;
    }

    if (status === 'expired') {
      icon.classList.add('fa-ban');
      return;
    }

    icon.classList.add('fa-gear', 'fa-spin');
  }
}
