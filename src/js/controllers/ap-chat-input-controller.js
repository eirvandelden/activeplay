import { Controller } from '@hotwired/stimulus';

import ApStore from '../ap-store.js';
import { sanitizeInputText } from '../security.mjs';

const REGEX_NAME = /(^"(?:\\?.)*?")|(^\w*)/i;
const REGEX_WHISPER = /(^\/w )|(^\/pm )|(^\/whisper )/i;
const REGEX_ROLL = /(^\/r )|(^\/roll )/i;
const REGEX_GMROLL = /(^\/gmr )|(^\/gmroll )/i;
const REGEX_HELP = /(^\/help)|(^\/\?)/i;

const HELP_TEXT = [
  '/r <span style="color: #4e74a5">or</span> /roll <span style="color: #4e74a5">ndx+b</span>',
  '/r <span style="color: #4e74a5">or</span> /roll <span style="color: #4e74a5">name ndn+b</span>',
  '/r <span style="color: #4e74a5">or</span> /roll <span style="color: #4e74a5">"name with space(s)"</span> <span style="color: #4e74a5">ndn+b</span>',
  '/gmr <span style="color: #4e74a5">or</span> /gmroll send dice roll to GM',
  '/w <span style="color: #4e74a5">or</span> /pm <span style="color: #4e74a5">or</span> /whisper "<span style="color: #4e74a5">recipient</span>" <span style="color: #4e74a5">message</span>',
  '/help <span style="color: #4e74a5">or</span> /?'
];

export default class extends Controller {
  static targets = ['input'];

  connect() {
    this.onFocusInput = this.onFocusInput.bind(this);
    document.addEventListener('ap:focus-input', this.onFocusInput);

    if (this.hasInputTarget) {
      this.inputTarget.value = ApStore.inputText || '';
    }
  }

  disconnect() {
    document.removeEventListener('ap:focus-input', this.onFocusInput);
  }

  processMessage() {
    if (!this.hasInputTarget || !this.inputTarget.value) {
      return;
    }

    const rawInput = this.inputTarget.value.toString();
    const input = sanitizeInputText(rawInput);
    const message = { text: input, timestamp: Date.now() };

    if (REGEX_WHISPER.test(rawInput)) {
      this.processWhisper(message);
    } else if (REGEX_ROLL.test(rawInput)) {
      message.text = input.replace(REGEX_ROLL, '').trim();
      this.dispatch('send-dice', { prefix: 'ap-chat-input', detail: message });
    } else if (REGEX_GMROLL.test(rawInput)) {
      this.processGmRoll(message);
    } else if (REGEX_HELP.test(rawInput)) {
      message.text = null;
      message.type = 'system';
      message.html = '<strong>Commands</strong><ul><li>' + HELP_TEXT.join('</li><li>') + '</li></ul>';
      this.dispatch('add-message', { prefix: 'ap-chat-input', detail: message });
    } else {
      this.dispatch('send-message', { prefix: 'ap-chat-input', detail: message });
    }

    this.inputTarget.value = '';
    ApStore.inputText = '';
  }

  processWhisper(message) {
    message.text = message.text.replace(REGEX_WHISPER, '');
    message.recipient = this.getRecipient(message.text);
    message.recipientId = this.getRecipientId(message.recipient);

    if (message.recipientId) {
      message.text = message.text.replace(message.recipient, '').replace('""', '').trim();
      this.dispatch('send-message', { prefix: 'ap-chat-input', detail: message });
      return;
    }

    this.dispatch('add-message', {
      prefix: 'ap-chat-input',
      detail: {
        text: message.recipient + ' is not online.',
        recipient: null,
        type: 'system',
        timestamp: Date.now()
      }
    });
  }

  processGmRoll(message) {
    message.text = message.text.replace(REGEX_GMROLL, '').trim();
    message.recipient = 'GM';
    message.recipientId = this.getRecipientId('GM');

    if (message.recipientId) {
      this.dispatch('send-dice', { prefix: 'ap-chat-input', detail: message });
      return;
    }

    this.dispatch('add-message', {
      prefix: 'ap-chat-input',
      detail: {
        text: 'GM is not online.',
        recipient: null,
        type: 'system',
        timestamp: Date.now()
      }
    });
  }

  getRecipient(data) {
    const matched = (data || '').match(REGEX_NAME);
    if (!matched || !matched[0]) {
      return '';
    }
    return matched[0].replace(/"/g, '');
  }

  getRecipientId(name) {
    const users = Array.isArray(ApStore.users) ? ApStore.users : [];
    const userName = (name || '').toLowerCase();

    const recipient = users.find(function findUser(user) {
      return (user.name || '').toLowerCase() === userName;
    });

    return recipient ? recipient.residentId : null;
  }

  onFocusInput() {
    if (!this.hasInputTarget) {
      return;
    }

    this.inputTarget.value = ApStore.inputText || '';
    this.inputTarget.focus();
  }
}
