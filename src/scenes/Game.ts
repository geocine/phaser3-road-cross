import Phaser from 'phaser';
import Enemy from '../entities/Enemy';
import Player from '../entities/Player';
import Goal from '../entities/Goal';

const SPAWN_GRACE_MS = 600;

export default class Demo extends Phaser.Scene {
  player: Player;
  enemy: Enemy;
  goal: Goal;
  isTerminating: boolean;

  winStreak: number;
  hintText?: Phaser.GameObjects.Text;
  treasureParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/dragon.png');
    this.load.image('goal', 'assets/treasure.png');
  }

  create() {
    // Reset transient state when the scene restarts.
    this.isTerminating = false;

    // Persist a simple win streak across restarts to gently ramp difficulty.
    this.winStreak = Number(this.registry.get('winStreak') ?? 0);

    this.add.sprite(320, 180, 'background');
    this.createTreasureParticles();
    this.createHud();
    this.createPlayer();
    this.createEnemies();
    this.createGoal();
  }

  update() {
    // don't execute if we are terminating
    if (this.isTerminating) return;
  }

  createHud() {
    const help = 'Hold/touch to move • Avoid dragons • Reach the treasure';

    this.hintText = this.add
      .text(12, 12, help, {
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: { left: 10, right: 10, top: 6, bottom: 6 }
      })
      .setScrollFactor(0)
      .setDepth(10);


    // Fade the hint after a few seconds so it doesn't distract.
    this.tweens.add({
      targets: this.hintText,
      delay: 3500,
      duration: 800,
      alpha: 0,
      ease: 'Sine.easeInOut'
    });
  }

  createTreasureParticles() {
    this.treasureParticles = this.add.particles(0, 0, 'goal', {
      x: 560,
      y: 180,
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      quantity: 30
    });
  }


  createPlayer() {
    this.player = new Player(this, 50, 180);
    this.player.startSpawnGrace(SPAWN_GRACE_MS);
    this.player.on('dead', () => {
      this.gameOver();
    });
  }

  createEnemies() {
    // Mild difficulty ramp: each consecutive win increases enemy speed a bit.
    const speedMultiplier = Phaser.Math.Clamp(1 + this.winStreak * 0.07, 1, 1.6);
    // Keep the first run slightly more open so the player learns the crossing rhythm
    // before later restarts return to the denser traffic pattern.
    const enemyCount = Phaser.Math.Clamp(4 + Math.ceil(this.winStreak / 2), 4, 7);
    const xStart = 110;
    const xEnd = 470;
    const yStart = 92;
    const yEnd = 268;
    const baseMinY = 80;
    const baseMaxY = 280;

    for (let i = 0; i < enemyCount; i++) {
      const progress = enemyCount === 1 ? 0.5 : i / (enemyCount - 1);
      const x = Phaser.Math.Linear(xStart, xEnd, progress);
      const y = Phaser.Math.Linear(yStart, yEnd, progress);
      const patrolShift = Phaser.Math.Linear(-18, 18, progress);
      const patrolInset = Math.abs(progress - 0.5) * 14;
      const minY = baseMinY + patrolShift + patrolInset;
      const maxY = baseMaxY + patrolShift - patrolInset;
      const enemy = new Enemy(this, x, y, speedMultiplier, {
        minY,
        maxY
      });
      enemy.setPlayer(this.player);
      enemy.on('kill', () => {
        this.player.kill();
      });
    }
  }

  createGoal() {
    this.goal = new Goal(this, 560, 180);
    this.goal.setPlayer(this.player);
    this.goal.on('reached', () => {
      if (this.isTerminating) return;
      this.winRound();
    });
  }

  winRound() {
    this.isTerminating = true;

    this.winStreak += 1;
    this.registry.set('winStreak', this.winStreak);

    // quick positive feedback
    this.treasureParticles?.emitParticleAt(this.goal.x, this.goal.y);
    this.cameras.main.flash(180, 255, 255, 255);

    this.time.delayedCall(220, () => {
      this.cameras.main.fade(250, 0, 0, 0);
    });

    this.cameras.main.once(
      'camerafadeoutcomplete',
      () => {
        this.scene.restart();
      },
      this
    );
  }

  gameOver() {
    // initiated game over sequence
    this.isTerminating = true;

    // Reset streak on death.
    this.winStreak = 0;
    this.registry.set('winStreak', this.winStreak);

    // shake camera
    this.cameras.main.shake(500);

    // listen for event completion
    this.cameras.main.once(
      'camerashakecomplete',
      () => {
        // fade out
        this.cameras.main.fade(500);
      },
      this
    );

    this.cameras.main.once(
      'camerafadeoutcomplete',
      () => {
        // restart the Scene
        this.scene.restart();
      },
      this
    );
  }
}
