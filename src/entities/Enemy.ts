import 'phaser';
export default class Enemy extends Phaser.GameObjects.Sprite {
  speed: number;
  minY: number;
  maxY: number;
  minSpeed: number;
  maxSpeed: number;
  direction: number;
  player: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    this.setScale(0.4);
    this.setFlipX(true);
    this.minY = 80;
    this.maxY = 280;
    this.minSpeed = 2;
    this.maxSpeed = 4.5;
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.speed =
      this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
  }

  setPlayer(player: Phaser.GameObjects.Sprite) {
    this.player = player;
  }

  preUpdate() {
    this.y += this.speed;

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
