import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants.js';
import { CHARACTER_ROSTER } from '../config/characters/index.js';
import { AssetLoader } from './AssetLoader.js';
import { GameLoop } from './GameLoop.js';
import { InputHandler } from '../systems/InputHandler.js';
import { AudioManager } from '../systems/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { SceneManager } from '../scenes/SceneManager.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { CharacterSelectScene } from '../scenes/CharacterSelectScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { PauseOverlay } from '../scenes/PauseOverlay.js';
import { PostMatchScene } from '../scenes/PostMatchScene.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    this.assetLoader = new AssetLoader();
    this.inputHandler = new InputHandler();
    this.audio = new AudioManager();
    this.ui = new UIManager();
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
    this._audioInitialized = false;
    this._lastDeltaTime = 0;

    // Default character configs (used as fallback by BattleScene)
    this.playerConfig = CHARACTER_ROSTER[0];
    this.enemyConfig = CHARACTER_ROSTER[1] || CHARACTER_ROSTER[0];

    // Scene Manager
    this.sceneManager = new SceneManager(this);

    // Responsive scaling
    this._resizeHandler = this._handleResize.bind(this);
  }

  async init() {
    this.ui.showLoading();

    // Register all sprite images for every character in the roster
    const spritePaths = this._getAllSpritePaths();
    spritePaths.forEach(path => this.assetLoader.register(path));

    // Load all images with progress
    await this.assetLoader.loadAll(progress => {
      this.ui.updateLoading(progress);
    });

    // Initialize audio on first user interaction (browser autoplay policy)
    const initAudio = () => {
      if (!this._audioInitialized) {
        this.audio.initContext();
        this._audioInitialized = true;
      }
    };
    window.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('click', initAudio, { once: true });

    // Register all scenes
    this.sceneManager.register('mainMenu', new MainMenuScene());
    this.sceneManager.register('characterSelect', new CharacterSelectScene());
    this.sceneManager.register('battle', new BattleScene());
    this.sceneManager.register('pause', new PauseOverlay());
    this.sceneManager.register('postMatch', new PostMatchScene());

    // Enable responsive canvas scaling
    this._handleResize();
    window.addEventListener('resize', this._resizeHandler);

    // Hide loading, start at main menu
    this.ui.hideLoading();
    this.sceneManager.switchTo('mainMenu');

    // Start game loop
    this.gameLoop.start();
  }

  _handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ratio = CANVAS_WIDTH / CANVAS_HEIGHT;

    // Preenche toda a tela mantendo proporção 16:9
    let newWidth = vw;
    let newHeight = newWidth / ratio;

    if (newHeight > vh) {
      newHeight = vh;
      newWidth = newHeight * ratio;
    }

    const scale = newWidth / CANVAS_WIDTH;
    this.canvas.style.transformOrigin = 'top left';
    this.canvas.style.transform = `scale(${scale})`;

    // Container ocupa a tela toda; canvas escalado vive dentro
    parent.style.width = `${newWidth}px`;
    parent.style.height = `${newHeight}px`;
  }

  _getCharacterSpritePaths(config) {
    const paths = [];
    for (const key of Object.keys(config.sprites)) {
      paths.push(`${config.spriteBasePath}/${config.sprites[key].src}`);
    }
    return paths;
  }

  _getAllSpritePaths() {
    const paths = [
      './images/background.png',
      './images/shop.png'
    ];
    for (const char of CHARACTER_ROSTER) {
      paths.push(...this._getCharacterSpritePaths(char));
    }
    return paths;
  }

  update(deltaTime) {
    this._lastDeltaTime = deltaTime;
    this.sceneManager.update(deltaTime);
  }

  render() {
    this.sceneManager.render(this.ctx);
  }
}

