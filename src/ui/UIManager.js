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
      this.elements.timer.innerHTML = Math.ceil(seconds);
    }
  }

  showResult(text) {
    if (this.elements.displayText) {
      this.elements.displayText.style.display = 'flex';
      this.elements.displayText.innerHTML = text;
    }
  }

  hideResult() {
    if (this.elements.displayText) {
      this.elements.displayText.style.display = 'none';
      this.elements.displayText.innerHTML = '';
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

  determineWinner(player, enemy) {
    if (player.health === enemy.health) {
      this.showResult('Empate');
    } else if (player.health > enemy.health) {
      this.showResult('Player 1 Venceu');
    } else {
      this.showResult('Player 2 Venceu');
    }
  }

  showHUD() {
    document.querySelector('.content')?.classList.remove('hud-hidden');
  }

  hideHUD() {
    document.querySelector('.content')?.classList.add('hud-hidden');
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
