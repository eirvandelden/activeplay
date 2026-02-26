import { Controller } from '@hotwired/stimulus';

import ApStore from '../ap-store.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTimestamp(timestamp) {
  if (typeof window.moment === 'function') {
    const local = new window.moment(new Date(timestamp));
    return local.calendar(null, { sameElse: 'MMM Do YYYY' });
  }

  return new Date(timestamp).toLocaleString();
}

export default class extends Controller {
  static targets = ['list'];

  connect() {
    this.render = this.render.bind(this);
    document.addEventListener('ap:messages-updated', this.render);
    this.render();
  }

  disconnect() {
    document.removeEventListener('ap:messages-updated', this.render);
  }

  privateMessage(event) {
    event.preventDefault();

    const userName = event.currentTarget.getAttribute('data-user-name');
    this.dispatch('private-message', {
      prefix: 'ap-chat-messages',
      detail: { userName: userName }
    });
  }

  render() {
    if (!this.hasListTarget) {
      return;
    }

    this.listTarget.innerHTML = ApStore.messages.map(this.renderMessage).join('');
  }

  renderMessage(message) {
    const sender = message.sender ? '<strong style="color: ' + escapeHtml(message.usercolor) + ';">' + escapeHtml(message.sender) + '</strong>' : '';
    const timestamp = message.timestamp ? '<span class="ap-timestamp" data-timestamp="' + escapeHtml(message.timestamp) + '"> ' + escapeHtml(formatTimestamp(message.timestamp)) + ' </span>' : '';

    const replyLink = message.showReply
      ? ' <a href="#" data-action="click->ap-chat-messages#privateMessage" data-user-name="' + escapeHtml(message.sender) + '"><i class="fa fa-reply"></i></a>'
      : '';

    const recipient = message.recipient
      ? '<strong style="color: #c5c5c5;"> <i class="fa fa-chevron-right"></i> ' + escapeHtml(message.recipient) + replyLink + '</strong>'
      : '';

    const cssClass = escapeHtml(message.cssClass || 'ap-msg-system');
    const textMessage = message.text ? '<div class="' + cssClass + '">' + escapeHtml(message.text) + '</div>' : '';
    const htmlMessage = message.html ? '<div class="' + cssClass + '">' + message.html + '</div>' : '';

    return '' +
      '<li>' +
        '<div style="word-wrap: break-word;">' +
          timestamp +
          sender +
          recipient +
        '</div>' +
        '<div class="ap-msg">' +
          textMessage +
          htmlMessage +
        '</div>' +
      '</li>';
  }
}
