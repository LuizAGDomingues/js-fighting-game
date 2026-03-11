export class UIManager {
  constructor() {
    this.elements = {
      playerHealth: document.querySelector('#playerHealth'),
      enemyHealth: document.querySelector('#enemyHealth'),
      timer: document.querySelector('#timer'),
      displayText: document.querySelector('#displayText'),
      loadingScreen: document.querySelector('#loading-screen'),
      loadingBar: document.querySelector('#loading-bar')
    };
  }

  updateHealth(playerId, healthPercent) {
    const selector = playerId === 'player' ? '#playerHealth' : '#enemyHealth';
    if (typeof gsap !== 'undefined') {
      gsap.to(selector, { width: healthPercent + '%' });
    } else {
      const el = document.querySelector(selector);
      if (el) el.style.width = healthPercent + '%';
    }
  }

  updateTimer(seconds) {
    if (this.elements.timer) {
      this.elements.timer.textContent = Math.ceil(seconds);
    }
  }

  showResult(text) {
    if (this.elements.displayText) {
      this.elements.displayText.style.display = 'flex';
      this.elements.displayText.textContent = text;
    }
  }

  hideResult() {
    if (this.elements.displayText) {
      this.elements.displayText.style.display = 'none';
      this.elements.displayText.textContent = '';
    }
  }

  showLoading() {
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.style.display = 'flex';
    }
  }

  updateLoading(progress) {
    if (this.elements.loadingBar) {
      this.elements.loadingBar.style.width = (progress * 100) + '%';
    }
  }

  hideLoading() {
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.style.display = 'none';
    }
  }

  setCharacterNames(playerName, enemyName) {
    const p1 = document.getElementById('p1-name');
    const p2 = document.getElementById('p2-name');
    if (p1) p1.textContent = playerName.toUpperCase();
    if (p2) p2.textContent = enemyName.toUpperCase();
  }

  resetHealthBars() {
    if (typeof gsap !== 'undefined') {
      gsap.to('#playerHealth', { width: '100%' });
      gsap.to('#enemyHealth', { width: '100%' });
    } else {
      if (this.elements.playerHealth) this.elements.playerHealth.style.width = '100%';
      if (this.elements.enemyHealth) this.elements.enemyHealth.style.width = '100%';
    }
  }
}
