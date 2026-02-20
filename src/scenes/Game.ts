import Phaser from 'phaser';
import Enemy from '../entities/Enemy';
import Player from '../entities/Player';
import Goal from '../entities/Goal';

export default class Demo extends Phaser.Scene {
  player: Player;
  enemy: Enemy;
  goal: Goal;
  isTerminating: boolean;
  hudText?: Phaser.GameObjects.Text;

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

    this.add.sprite(320, 180, 'background');
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
    this.hudText = this.add
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
      targets: this.hudText,
      delay: 3500,
      duration: 800,
      alpha: 0,
      ease: 'Sine.easeInOut'
    });
  }

  createPlayer() {
    this.player = new Player(this, 50, 180);
    this.player.on('dead', () => {
      this.gameOver();
    });
  }

  createEnemies() {
    for (let i = 0, x = 90, y = 100; i < 5; i++) {
      const enemy = new Enemy(this, x, y);
      enemy.setPlayer(this.player);
      enemy.on('kill', () => {
        this.player.kill();
      });
      x += 80;
      y += 20;
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

    // quick positive feedback
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
