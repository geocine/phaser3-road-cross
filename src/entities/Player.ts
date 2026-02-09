import Phaser from 'phaser';

type PlayerKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
};

export default class Player extends Phaser.GameObjects.Sprite {
  playerSpeed: number;
  dead: boolean;
  keys?: PlayerKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    this.setScale(0.5);

    // pixels per second
    this.playerSpeed = 180;
    this.dead = false;

    // Optional keyboard controls (desktop): arrows / A-D (and Space to move right).
    // Guarded so this doesn't break in environments without the keyboard plugin.
    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      this.keys = keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
      }) as PlayerKeys;
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.dead) return;

    const dt = delta / 1000;

    const moveRightFromPointer = this.scene.input.activePointer.isDown;
    const moveLeftFromKeys = !!this.keys && (this.keys.left.isDown || this.keys.a.isDown);
    const moveRightFromKeys =
      !!this.keys && (this.keys.right.isDown || this.keys.d.isDown || this.keys.space.isDown);

    if (moveLeftFromKeys) this.x -= this.playerSpeed * dt;
    if (moveRightFromKeys || moveRightFromPointer) this.x += this.playerSpeed * dt;

    // Keep player within the visible game bounds.
    const halfW = this.displayWidth / 2;
    const maxX = this.scene.scale.width - halfW;
    const minX = halfW;
    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
  }

  kill() {
    this.dead = true;
    this.emit('dead');
  }

  restart() {
    this.dead = false;
  }
}
