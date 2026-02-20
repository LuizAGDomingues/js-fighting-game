/**
 * SceneManager — Gerencia transições entre cenas (menu, seleção, batalha, etc.)
 * Cada cena implementa: enter(data), update(dt), render(ctx), exit()
 */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = {};
    this.currentScene = null;
    this.currentName = null;
  }

  register(name, scene) {
    scene.sceneManager = this;
    scene.game = this.game;
    this.scenes[name] = scene;
  }

  switchTo(name, data = {}) {
    if (this.currentScene) {
      this.currentScene.exit();
    }
    this.currentScene = this.scenes[name];
    this.currentName = name;
    if (this.currentScene) {
      this.currentScene.enter(data);
    }
  }

  update(deltaTime) {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  render(ctx) {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }
}
