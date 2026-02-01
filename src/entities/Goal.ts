import Phaser from 'phaser';

export default class Goal extends Phaser.GameObjects.Sprite {
  player: Phaser.GameObjects.Sprite;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'goal');
    scene.add.existing(this);
    this.setScale(0.5);
  }

  setPlayer(player: Phaser.GameObjects.Sprite) {
    this.player = player;
  }

  preUpdate() {
    let playerRect = this.player.getBounds();
    let treasureRect = this.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
      console.log('reached goal');
      return this.emit('reached');
    }
  }
}
