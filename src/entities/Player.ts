import 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
  playerSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    this.setScale(0.5);
    this.playerSpeed = 3;
  }

  preUpdate() {
    if (this.scene.input.activePointer.isDown) {
      this.x += this.playerSpeed;
    }
  }
}
