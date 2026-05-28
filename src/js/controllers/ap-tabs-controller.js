import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['tab', 'panel'];

  connect() {
    this.onSwitchTab = this.onSwitchTab.bind(this);
    this.element.addEventListener('ap:switch-tab', this.onSwitchTab);

    if (this.panelTargets.length > 0) {
      const firstPanel = this.panelTargets[0];
      const panelId = firstPanel.getAttribute('data-tabs-panel') || firstPanel.id;
      this.activate(panelId);
    }
  }

  disconnect() {
    this.element.removeEventListener('ap:switch-tab', this.onSwitchTab);
  }

  select(event) {
    event.preventDefault();
    const panelId = event.currentTarget.getAttribute('data-tabs-panel');
    this.activate(panelId);
  }

  onSwitchTab(event) {
    const detail = event.detail || {};
    if (!detail.panelId) {
      return;
    }

    this.activate(detail.panelId);
  }

  activate(panelId) {
    if (!panelId) {
      return;
    }

    this.tabTargets.forEach(function eachTab(tab) {
      const link = tab.querySelector('[data-tabs-panel]');
      const linkPanelId = link ? link.getAttribute('data-tabs-panel') : tab.getAttribute('data-tabs-panel');
      tab.classList.toggle('active', linkPanelId === panelId);
    });

    this.panelTargets.forEach(function eachPanel(panel) {
      const linkPanelId = panel.getAttribute('data-tabs-panel') || panel.id;
      panel.classList.toggle('active', linkPanelId === panelId);
    });
  }
}
