import Phaser from 'phaser';
import Player from './Player';
export default class Enemy extends Phaser.GameObjects.Sprite {
  speed: number;
  minY: number;
  maxY: number;
  minSpeed: number;
  maxSpeed: number;
  direction: number;
  player: Player;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    this.setScale(0.4);
    this.setFlipX(true);
    this.minY = 80;
    this.maxY = 280;
    // pixels per second
    this.minSpeed = 120;
    this.maxSpeed = 270;
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.speed =
      this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
  }

  setPlayer(player: Player) {
    this.player = player;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.player.dead) return;

    const dt = delta / 1000;
    this.y += this.speed * dt;

    const conditionUp = this.speed < 0 && this.y <= this.minY;
    const conditionDown = this.speed > 0 && this.y >= this.maxY;

    if (conditionUp || conditionDown) {
      this.speed *= -1;
    }

    let playerRect = this.player.getBounds();
    let enemyRect = this.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      return this.emit('kill');
    }
  }
}
