import Phaser from 'phaser';
import Player from './Player';

function insetRect(rect: Phaser.Geom.Rectangle, insetXPct: number, insetYPct: number) {
  const insetX = rect.width * insetXPct;
  const insetY = rect.height * insetYPct;
  return new Phaser.Geom.Rectangle(
    rect.x + insetX / 2,
    rect.y + insetY / 2,
    rect.width - insetX,
    rect.height - insetY
  );
}

export default class Enemy extends Phaser.GameObjects.Sprite {
  speed: number;
  minY: number;
  maxY: number;
  minSpeed: number;
  maxSpeed: number;
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
    this.speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);

    // randomize direction per enemy so patterns feel less uniform
    if (Math.random() < 0.5) this.speed *= -1;
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

    // Slightly shrink hitboxes so collisions feel fairer than sprite bounds.
    const playerRect = insetRect(this.player.getBounds(), 0.2, 0.25);
    const enemyRect = insetRect(this.getBounds(), 0.28, 0.35);

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      return this.emit('kill');
    }
  }
}
