class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    // Cargar imágenes necesarias para la pantalla de inicio
    this.load.image('road', 'assets/road-2.png');
    this.load.image('truck', 'assets/truck.png');
    this.load.image('cargo', 'assets/cargo.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('cyclist', 'assets/cyclist.png');
    this.load.image('hole', 'assets/hole.png');

    this.load.audio('music', 'assets/sounds/music.mp3');
    this.load.audio('pickup', 'assets/sounds/pickup.mp3');
    this.load.audio('crash', 'assets/sounds/crash.mp3');
    this.load.audio('holeSound', 'assets/sounds/hole.mp3');
    this.load.audio('gameoverSound', 'assets/sounds/gameover.mp3');
  }

  create() {
    this.add.image(960, 540, 'fondo').setDisplaySize(1920, 1080);
    // Fondo animado
    this.add.tileSprite(200, 300, 400, 600, 'road');

    // Título del juego
    this.add.text(200, 150, "🚛 TRANSPORTES TRANES", {
      fontSize: '28px',
      fill: '#fff',
      fontStyle: 'Press Start 2P'
    }).setOrigin(0.5);

    // Botón JUGAR
    let startButton = this.add.text(200, 300, "▶ JUGAR", {
      fontSize: '32px',
      fill: '#000',
      backgroundColor: '#fff',
      fontStyle: 'Press Start 2P',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Botón de instrucciones que abre modal HTML
    let instructionsButton = this.add.text(200, 400, "ℹ️ Instrucciones", {
      fontSize: '20px',
      fill: '#fff',
      fontStyle: 'Press Start 2P'
    }).setOrigin(0.5).setInteractive();

    instructionsButton.on('pointerdown', () => {
      openModal('instructionsModal'); // función de modals.js
    });
  }
}
