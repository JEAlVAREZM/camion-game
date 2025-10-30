class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    // Fondos y sprites
    this.load.image('road', 'assets/road-2.png');
    this.load.image('btnPlay', 'assets/btn_play.png'); 
    this.load.image('btnMaquinaria', 'assets/btn_maquinaria.png'); 
    this.load.image('btnInfo', 'assets/btn_info.png');  
    this.load.image('truck', 'assets/truck.png');
    this.load.image('cargo', 'assets/cargo.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('cyclist', 'assets/cyclist.png');
    this.load.image('hole', 'assets/hole.png');

    // Sonidos
    this.load.audio('music', 'assets/sounds/music.mp3');
    this.load.audio('pickup', 'assets/sounds/pickup.mp3');
    this.load.audio('crash', 'assets/sounds/crash.mp3');
    this.load.audio('holeSound', 'assets/sounds/hole.mp3');
    this.load.audio('gameoverSound', 'assets/sounds/gameover.mp3');
  }

  create() {
    const { width, height } = this.scale;

    const btnMaquinaria = this.add.image(width/2, height/2 + 70, 'btnMaquinaria')
      .setDisplaySize(350, 110)
      .setInteractive();

    btnMaquinaria.on('pointerdown', () => this.scene.start('LoaderScene'));

    // Fondo (road ocupa todo el canvas como guía de la carretera)
    this.add.tileSprite(width/2, height/2, width, height, 'road');

    // Botón JUGAR
    let startButton = this.add.image(width/2, height/2 - 50, 'btnPlay')
      .setDisplaySize(350, 110)
      .setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Botón INSTRUCCIONES
    let instructionsButton = this.add.image(width/2, height/2 + 100, 'btnInfo')
      .setDisplaySize(300, 90)
      .setInteractive();

    instructionsButton.on('pointerdown', () => {
      openModal('instructionsModal'); // función de modals.js
    });
  }
}
