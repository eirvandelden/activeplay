import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  roll(event) {
    event.preventDefault();

    const dice = event.currentTarget.getAttribute('data-dice') || '';
    if (!dice) {
      return;
    }

    const text = dice === 'FATE' ? 'FATE' : '1' + dice;
    this.dispatch('send-dice', {
      prefix: 'ap-dice-bag',
      detail: { text: text, timestamp: Date.now() }
    });
  }
}
