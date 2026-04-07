import Phaser from 'phaser';
import Player from './Player';

type TravelDirection = -1 | 1;

type EnemyPatrolConfig = {
  minY?: number;
  maxY?: number;
  turnPauseMs?: number;
};

function insetRect(
  rect: Phaser.Geom.Rectangle,
  insetXPct: number,
  insetYPct: number
) {
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
  turnPauseMs: number;
  turnPauseRemainingMs: number;
  speedMagnitude: number;
  pendingDirection?: TravelDirection;
  player: Player;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    speedMultiplier: number = 1,
    patrolConfig: EnemyPatrolConfig = {}
  ) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    this.setScale(0.4);
    this.setFlipX(true);
    this.minY = patrolConfig.minY ?? 80;
    this.maxY = patrolConfig.maxY ?? 280;
    this.turnPauseMs = patrolConfig.turnPauseMs ?? 110;
    this.turnPauseRemainingMs = 0;

    // pixels per second
    this.minSpeed = 120 * speedMultiplier;
    this.maxSpeed = 270 * speedMultiplier;

    // Randomize both speed and initial patrol direction so enemies don't all start
    // moving down in sync.
    const direction: TravelDirection = Math.random() < 0.5 ? 1 : -1;
    this.speedMagnitude = Phaser.Math.FloatBetween(this.minSpeed, this.maxSpeed);
    this.speed = this.speedMagnitude * direction;
  }

  setPlayer(player: Player) {
    this.player = player;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.player.dead) return;

    if (this.turnPauseRemainingMs > 0) {
      this.turnPauseRemainingMs = Math.max(0, this.turnPauseRemainingMs - delta);
      if (this.turnPauseRemainingMs === 0 && this.pendingDirection !== undefined) {
        this.speed = this.speedMagnitude * this.pendingDirection;
        this.pendingDirection = undefined;
        this.clearTint();
      }
    } else {
      const dt = delta / 1000;
      this.y += this.speed * dt;

      const conditionUp = this.speed < 0 && this.y <= this.minY;
      const conditionDown = this.speed > 0 && this.y >= this.maxY;

      if (conditionUp || conditionDown) {
        // Avoid drifting past bounds on low-FPS frames.
        this.y = Phaser.Math.Clamp(this.y, this.minY, this.maxY);
        this.startTurnPause(conditionUp ? 1 : -1);
      }
    }

    // Slightly shrink hitboxes so collisions feel fairer than sprite bounds.
    const playerRect = insetRect(this.player.getBounds(), 0.2, 0.25);
    const enemyRect = insetRect(this.getBounds(), 0.28, 0.35);

    if (this.player.invulnerable) return;

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      return this.emit('kill');
    }
  }

  startTurnPause(nextDirection: TravelDirection) {
    this.speed = 0;
    this.pendingDirection = nextDirection;
    this.turnPauseRemainingMs = this.turnPauseMs;
    this.setTint(0xfff2a8);
  }
}
