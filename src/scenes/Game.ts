import 'phaser';
import Enemy from '../entities/Enemy';
import Player from '../entities/Player';
import Goal from '../entities/Goal';

export default class Demo extends Phaser.Scene {
  player: Player;
  enemy: Enemy;
  goal: Goal;

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
    this.add.sprite(320, 180, 'background');
    this.createPlayer();
    this.createEnemies();
    this.createGoal();
  }

  update() {}

  createPlayer() {
    this.player = new Player(this, 50, 180);
  }

  createEnemies() {
    for (let i = 0, x = 90, y = 100; i < 5; i++, x += 80, y += 20) {
      const enemy = new Enemy(this, x, y);
      enemy.setPlayer(this.player);
    }
  }

  createGoal() {
    this.goal = new Goal(this, 560, 180);
    this.goal.setPlayer(this.player);
  }
}
