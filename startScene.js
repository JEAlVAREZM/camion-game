class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    // Cargar imágenes necesarias para la pantalla de inicio
    this.load.image('road', 'assets/road.png');
    this.load.image('truck', 'assets/truck.png');
    this.load.image('cargo', 'assets/cargo.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('cyclist', 'assets/cyclist.png');
    this.load.image('hole', 'assets/hole.png');
  }

  create() {
    // Fondo animado
    this.add.tileSprite(200, 300, 400, 600, 'road');

    // Título del juego
    this.add.text(200, 150, "🚛 Transporte Arcade", {
      fontSize: '28px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botón JUGAR
    let startButton = this.add.text(200, 300, "▶ JUGAR", {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Botón de instrucciones que abre modal HTML
    let instructionsButton = this.add.text(200, 400, "ℹ️ Instrucciones", {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5).setInteractive();

    instructionsButton.on('pointerdown', () => {
      openModal('instructionsModal'); // función de modals.js
    });
  }
}
