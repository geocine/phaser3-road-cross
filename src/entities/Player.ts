import Phaser from 'phaser';

type PlayerKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
};

export default class Player extends Phaser.GameObjects.Sprite {
  maxMoveSpeed: number;
  moveAcceleration: number;
  moveFriction: number;
  reverseAccelerationMultiplier: number;
  stopSnapSpeed: number;
  pointerApproachFactor: number;
  horizontalVelocity: number;
  dead: boolean;
  invulnerable: boolean;
  keys?: PlayerKeys;
  spawnGraceTimer?: Phaser.Time.TimerEvent;
  spawnGraceTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    this.setScale(0.5);

    // Movement tuning keeps input responsive while softening abrupt direction changes.
    this.maxMoveSpeed = 220;
    this.moveAcceleration = 1200;
    this.moveFriction = 1800;
    this.reverseAccelerationMultiplier = 1.75;
    this.stopSnapSpeed = 24;
    this.pointerApproachFactor = 7;
    this.horizontalVelocity = 0;
    this.dead = false;
    this.invulnerable = false;

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

    const moveLeftFromKeys = !!this.keys && (this.keys.left.isDown || this.keys.a.isDown);
    const moveRightFromKeys =
      !!this.keys && (this.keys.right.isDown || this.keys.d.isDown || this.keys.space.isDown);

    // Pointer / touch controls: hold to move. Move direction is based on the pointer position
    // relative to the player so mobile can move both left and right.
    const pointer = this.scene.input.activePointer;
    const hasPointerInput = pointer.isDown;
    const pointerX = pointer.worldX ?? pointer.x;
    const pointerDeadZonePx = 14;

    let desiredVelocity = 0;
    if (moveLeftFromKeys) desiredVelocity -= this.maxMoveSpeed;
    if (moveRightFromKeys) desiredVelocity += this.maxMoveSpeed;

    if (desiredVelocity === 0 && hasPointerInput) {
      const pointerDeltaX = pointerX - this.x;
      if (Math.abs(pointerDeltaX) > pointerDeadZonePx) {
        // Scale speed by distance so touch controls settle onto the held position
        // instead of overshooting and oscillating around the finger.
        desiredVelocity = Phaser.Math.Clamp(
          pointerDeltaX * this.pointerApproachFactor,
          -this.maxMoveSpeed,
          this.maxMoveSpeed
        );
      }
    }

    const isReversing =
      desiredVelocity !== 0 &&
      this.horizontalVelocity !== 0 &&
      Math.sign(desiredVelocity) !== Math.sign(this.horizontalVelocity);
    const appliedAcceleration = isReversing
      ? this.moveAcceleration * this.reverseAccelerationMultiplier
      : desiredVelocity === 0
        ? this.moveFriction
        : this.moveAcceleration;
    const maxDelta = appliedAcceleration * dt;
    const velocityDelta = desiredVelocity - this.horizontalVelocity;
    if (Math.abs(velocityDelta) <= maxDelta) {
      this.horizontalVelocity = desiredVelocity;
    } else {
      this.horizontalVelocity += Math.sign(velocityDelta) * maxDelta;
    }

    if (desiredVelocity === 0 && Math.abs(this.horizontalVelocity) < this.stopSnapSpeed) {
      this.horizontalVelocity = 0;
    }

    this.x += this.horizontalVelocity * dt;

    // Keep player within the visible game bounds.
    const halfW = this.displayWidth / 2;
    const maxX = this.scene.scale.width - halfW;
    const minX = halfW;
    this.x = Phaser.Math.Clamp(this.x, minX, maxX);

    if ((this.x === minX && this.horizontalVelocity < 0) || (this.x === maxX && this.horizontalVelocity > 0)) {
      this.horizontalVelocity = 0;
    }
  }

  kill() {
    this.dead = true;
    this.emit('dead');
  }

  startSpawnGrace(durationMs: number = 600) {
    this.endSpawnGrace();
    this.invulnerable = true;

    this.spawnGraceTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.45,
      duration: 90,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.spawnGraceTimer = this.scene.time.delayedCall(durationMs, () => {
      this.endSpawnGrace();
    });
  }

  endSpawnGrace() {
    this.invulnerable = false;
    this.spawnGraceTimer?.remove(false);
    this.spawnGraceTimer = undefined;
    this.spawnGraceTween?.stop();
    this.spawnGraceTween = undefined;
    this.setAlpha(1);
  }

  restart() {
    this.dead = false;
    this.horizontalVelocity = 0;
    this.endSpawnGrace();
  }
}
