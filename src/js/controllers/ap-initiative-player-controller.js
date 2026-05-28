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

function toNumber(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sortedEntities(entities) {
  return (entities || []).slice().sort(function byInitiative(a, b) {
    return (toNumber(b.initiative, 0) - toNumber(a.initiative, 0));
  });
}

function badgeIdForEntity(entity) {
  if (!entity) {
    return '';
  }

  if (entity.name === 'GM' || entity.residentName === 'GM') {
    return 'badge_gm_' + (entity.residentId || entity.id || '');
  }

  return 'badge_' + (entity.characterId || entity.id || '');
}

function applyActiveUsers() {
  document.querySelectorAll('.eb-v1-badge-gm, .eb-v1-badge-Character').forEach(function clearBadge(badge) {
    badge.classList.remove('active');
  });

  ApStore.users.forEach(function activateUser(user) {
    const id = user.name === 'GM'
      ? 'badge_gm_' + user.residentId
      : 'badge_' + user.characterId;

    const badge = document.getElementById(id);
    if (badge) {
      badge.classList.add('active');
    }
  });
}

export default class extends Controller {
  static targets = ['turnDisplay', 'roundDisplay', 'entityList'];

  connect() {
    this.render = this.render.bind(this);
    document.addEventListener('ap:initiative-updated', this.render);
    document.addEventListener('ap:users-updated', this.render);
    this.render();
  }

  disconnect() {
    document.removeEventListener('ap:initiative-updated', this.render);
    document.removeEventListener('ap:users-updated', this.render);
  }

  render() {
    if (!this.hasEntityListTarget) {
      return;
    }

    const initiative = ApStore.initiative;
    const entities = sortedEntities(initiative.entities);

    if (this.hasTurnDisplayTarget) {
      this.turnDisplayTarget.textContent = String(toNumber(initiative.turn, 0) + 1);
    }

    if (this.hasRoundDisplayTarget) {
      this.roundDisplayTarget.textContent = String(toNumber(initiative.round, 0) + 1);
    }

    this.entityListTarget.innerHTML = entities.map(function renderEntity(entity, index) {
      const isCurrentTurn = index === toNumber(initiative.turn, 0);
      const badgeId = badgeIdForEntity(entity);

      return '' +
        '<li>' +
          '<div id="' + escapeHtml(badgeId) + '" class="eb-v1-badge eb-v1-badge-' + escapeHtml(entity.type || 'Character') + ' initiative">' +
            '<div class="row">' +
              '<div class="small-10 columns">' +
                '<div class="clipper"><strong>' + escapeHtml(entity.name) + '</strong></div>' +
              '</div>' +
              '<div class="small-1 columns text-right"><strong>' + escapeHtml(toNumber(entity.initiative, 0)) + '</strong></div>' +
              '<div class="small-1 columns">' +
                (isCurrentTurn ? '<span class="iconlink added"><i class="fa fa-check" style="position: absolute; left: .25em; font-size: 1.6em;"></i></span>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</li>';
    }).join('');

    applyActiveUsers();
  }
}
