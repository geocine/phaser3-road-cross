import Phaser from 'phaser';
import Enemy from '../entities/Enemy';
import Player from '../entities/Player';
import Goal from '../entities/Goal';

export default class Demo extends Phaser.Scene {
  player: Player;
  enemy: Enemy;
  goal: Goal;
  isTerminating: boolean;

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
    this.createPlayer();
    this.createEnemies();
    this.createGoal();
  }

  update() {
    // don't execute if we are terminating
    if (this.isTerminating) return;
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
      this.scene.restart();
    });
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
