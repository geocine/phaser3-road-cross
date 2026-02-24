import Phaser from 'phaser';

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

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Allow a little forgiveness so the player doesn't need pixel-perfect overlap.
    const playerRect = insetRect(this.player.getBounds(), 0.15, 0.2);
    const treasureRect = insetRect(this.getBounds(), 0.2, 0.25);

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
      return this.emit('reached');
    }
  }
}
