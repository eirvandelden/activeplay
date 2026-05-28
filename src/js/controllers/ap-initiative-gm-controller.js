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

  updateTurn(event) {
    event.preventDefault();

    ApStore.initiative.turn = toNumber(ApStore.initiative.turn, 0) + toNumber(event.currentTarget.getAttribute('data-step'), 0);
    this.cycleTurn();
  }

  updateRound(event) {
    event.preventDefault();

    ApStore.initiative.round = toNumber(ApStore.initiative.round, 0) + toNumber(event.currentTarget.getAttribute('data-step'), 0);
    ApStore.initiative.turn = 0;

    if (ApStore.initiative.round < 0) {
      ApStore.initiative.round = 0;
    }

    this.sendTurn();
    this.render();
  }

  setTurn(event) {
    event.preventDefault();

    ApStore.initiative.turn = toNumber(event.currentTarget.getAttribute('data-index'), 0);
    this.cycleTurn();
  }

  resetInitiative(event) {
    event.preventDefault();

    ApStore.initiative.turn = 0;
    ApStore.initiative.round = 0;

    ApStore.initiative.entities.forEach(function resetEntity(entity) {
      entity.initiative = 0;
    });

    this.sendTurn();
    this.sendEntities();
  }

  removeEntity(event) {
    event.preventDefault();

    const entityId = event.currentTarget.getAttribute('data-entity-id');
    ApStore.initiative.entities = ApStore.initiative.entities.filter(function keepEntity(entity) {
      return String(entity.id) !== String(entityId);
    });

    this.sendEntities();
  }

  onInitiativeBlur(event) {
    const entityId = event.currentTarget.getAttribute('data-entity-id');
    const entity = ApStore.initiative.entities.find(function findEntity(item) {
      return String(item.id) === String(entityId);
    });

    if (!entity) {
      return;
    }

    const value = toNumber(event.currentTarget.value, 0);
    entity.initiative = Math.max(0, Math.min(99, value));
    event.currentTarget.value = String(entity.initiative);

    this.sendEntities();
  }

  onInitiativeKeypress(event) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    event.currentTarget.blur();
  }

  cycleTurn() {
    const entities = sortedEntities(ApStore.initiative.entities);

    if (entities.length === 0) {
      ApStore.initiative.turn = 0;
      if (ApStore.initiative.round < 0) {
        ApStore.initiative.round = 0;
      }
      this.sendTurn();
      this.render();
      return;
    }

    if (ApStore.initiative.turn > (entities.length - 1)) {
      ApStore.initiative.turn = 0;
      ApStore.initiative.round = toNumber(ApStore.initiative.round, 0) + 1;
    }

    if (ApStore.initiative.turn < 0) {
      if (ApStore.initiative.round > 1) {
        ApStore.initiative.turn = entities.length - 1;
      } else {
        ApStore.initiative.turn = 0;
      }

      if (ApStore.initiative.round > 0) {
        ApStore.initiative.round = ApStore.initiative.round - 1;
      }
    }

    this.sendTurn();
    this.render();
  }

  sendTurn() {
    const socket = window._apSocket;
    if (!socket) {
      return;
    }

    socket.emit('initiative:setTurn', {
      turn: ApStore.initiative.turn,
      round: ApStore.initiative.round
    });

    ApStore.notify('ap:initiative-updated', { initiative: ApStore.initiative });
  }

  sendEntities() {
    const socket = window._apSocket;
    if (socket) {
      socket.emit('initiative:setEntities', { entities: ApStore.initiative.entities });
    }

    ApStore.notify('ap:initiative-updated', { initiative: ApStore.initiative });
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
              '<div class="small-1 columns">' +
                '<span style="margin-top: .6em; float: left; color: #c5c5c5">' +
                  '<a href="#" class="iconlink add' + (isCurrentTurn ? ' added' : '') + '" data-action="click->ap-initiative-gm#setTurn" data-index="' + index + '"><i class="fa fa-chevron-right" style="font-size: 1.5em;"></i></a>' +
                '</span>' +
              '</div>' +
              '<div class="small-8 columns">' +
                '<div class="eb-v1-badge-over eb-v1-badge-reduced clipper"><span class="eb-v1-badge-name">' + escapeHtml(entity.name) + '</span></div>' +
                '<div class="eb-v1-badge-under clipper">' + escapeHtml(entity.residentName) + '</div>' +
              '</div>' +
              '<div class="small-2 columns">' +
                '<div class="eb-v1-badge-over eb-v1-badge-reduced clipper">' +
                  '<input type="number" min="0" max="99" value="' + escapeHtml(toNumber(entity.initiative, 0)) + '" class="eb-v1-card-input" data-entity-id="' + escapeHtml(entity.id) + '" data-action="blur->ap-initiative-gm#onInitiativeBlur keypress->ap-initiative-gm#onInitiativeKeypress" style="margin-bottom: -1px !important; font-weight: bold;">' +
                '</div>' +
                '<div class="eb-v1-badge-under clipper text-center"><i class="fa fa-clock-o"></i> Init</div>' +
              '</div>' +
              '<div class="small-1 columns">' +
                '<span style="margin-top: .6em; float: right;">' +
                  '<a href="#" data-action="click->ap-initiative-gm#removeEntity" data-entity-id="' + escapeHtml(entity.id) + '" style="width: 2em; display:inline-block; text-align: right;" class="iconlink delete"><i class="fa fa-times-circle" style="font-size: 1.5em;"></i></a>' +
                '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</li>';
    }).join('');

    applyActiveUsers();
  }
}
