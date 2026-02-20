export class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.paths = [];
    this.loaded = 0;
    this.total = 0;
  }

  register(path) {
    if (!this.cache.has(path)) {
      this.paths.push(path);
      this.total++;
    }
  }

  loadAll(onProgress) {
    return Promise.all(
      this.paths.map(path => this._loadImage(path, onProgress))
    );
  }

  _loadImage(path, onProgress) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(path)) {
        this.loaded++;
        if (onProgress) onProgress(this.loaded / this.total);
        resolve(this.cache.get(path));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.cache.set(path, img);
        this.loaded++;
        if (onProgress) onProgress(this.loaded / this.total);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${path}`);
        this.loaded++;
        if (onProgress) onProgress(this.loaded / this.total);
        reject(new Error(`Failed to load: ${path}`));
      };
      img.src = path;
    });
  }

  get(path) {
    const img = this.cache.get(path);
    if (!img) {
      throw new Error(`Image not loaded: ${path}. Did you register() and loadAll()?`);
    }
    return img;
  }
}
