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

    // También se usan luego en GameScene (si ya están en caché, no pasa nada):
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
    this.load.audio('menuMusic', 'assets/sounds/menuMusic.mp3');

  }

create() {
  const { width, height } = this.scale;

  // 🛣️ Fondo
  this.add.tileSprite(width / 2, height / 2, width, height, 'road');

  
  // 🎵 Música del menú
if (!this.sound.get('menuMusic')) {
  this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
  this.menuMusic.play();
} else {
  this.menuMusic = this.sound.get('menuMusic');
  if (!this.menuMusic.isPlaying) this.menuMusic.play();
}

// 🔇 Función para detener música suavemente
const stopMenuMusic = () => {
  if (this.menuMusic && this.menuMusic.isPlaying) {
    this.tweens.add({
      targets: this.menuMusic,
      volume: 0,
      duration: 600,
      onComplete: () => {
        this.menuMusic.stop();
        this.menuMusic.destroy();
      }
    });
  }
};


  // 🚛 Botón CAMIÓN
  const btnCamion = this.add.image(width / 2, height / 2 - 60, 'btnPlay')
    .setInteractive()
    .setScale(0.6);

  btnCamion.on('pointerdown', () => {
    stopMenuMusic();
    this.scene.start('GameScene');
  });

  // 🚜 Botón MAQUINARIA
  const btnMaquinaria = this.add.image(width / 2, height / 2 + 40, 'btnMaquinaria')
    .setInteractive()
    .setScale(0.6);

  btnMaquinaria.on('pointerdown', () => {
    stopMenuMusic();
    this.scene.start('MaquinariaScene');
  });

  // ℹ️ Botón INSTRUCCIONES
  const btnInfo = this.add.image(width / 2, height / 2 + 140, 'btnInfo')
    .setInteractive()
    .setScale(0.6);

  btnInfo.on('pointerdown', () => {
    openModal('instructionsModal');
  });
}


}
