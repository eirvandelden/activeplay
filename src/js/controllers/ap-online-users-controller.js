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

export default class extends Controller {
  static targets = ['list'];

  connect() {
    this.render = this.render.bind(this);
    document.addEventListener('ap:users-updated', this.render);
    this.render();
  }

  disconnect() {
    document.removeEventListener('ap:users-updated', this.render);
  }

  whisper(event) {
    event.preventDefault();

    const userName = event.currentTarget.getAttribute('data-user-name');
    document.dispatchEvent(new CustomEvent('ap:private-message-requested', {
      detail: { userName: userName }
    }));
  }

  render() {
    if (!this.hasListTarget) {
      return;
    }

    const users = Array.isArray(ApStore.users) ? ApStore.users : [];

    this.listTarget.innerHTML = users.map(function eachUser(user) {
      const safeName = escapeHtml(user.name || 'Unknown');

      return '' +
        '<li>' +
          '<a href="#" data-action="click->ap-online-users#whisper" data-user-name="' + safeName + '">' +
            '<i class="fa fa-paper-plane"></i> ' + safeName +
          '</a>' +
        '</li>';
    }).join('');

    this.toggleActiveUsers(users);
  }

  toggleActiveUsers(users) {
    document.querySelectorAll('.eb-v1-badge-gm, .eb-v1-badge-Character').forEach(function clearBadge(badge) {
      badge.classList.remove('active');
    });

    users.forEach(function activateUser(user) {
      const id = user.name === 'GM'
        ? 'badge_gm_' + user.residentId
        : 'badge_' + user.characterId;

      const badge = document.getElementById(id);
      if (badge) {
        badge.classList.add('active');
      }
    });
  }
}
