import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
  playerSpeed: number;
  dead: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    this.setScale(0.5);

    // pixels per second
    this.playerSpeed = 180;
    this.dead = false;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.dead) return;

    if (this.scene.input.activePointer.isDown) {
      const dt = delta / 1000;
      this.x += this.playerSpeed * dt;

      // Keep player within the visible game bounds.
      const halfW = this.displayWidth / 2;
      const maxX = this.scene.scale.width - halfW;
      const minX = halfW;
      this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    }
  }

  kill() {
    this.dead = true;
    this.emit('dead');
  }

  restart() {
    this.dead = false;
  }
}
