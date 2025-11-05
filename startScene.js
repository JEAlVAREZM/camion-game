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

  // Fondo del menú
  this.add.tileSprite(width/2, height/2, width, height, 'road');

  // ===== Música de menú (singleton global) =====
  if (!window.menuMusic) {
    window.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
  }
  if (!window.menuMusic.isPlaying) {
    window.menuMusic.play();
  }

  // Botones
  const btnCamion = this.add.image(width/2, height/2 - 60, 'btnPlay').setInteractive().setScale(0.6);
  const btnMaquinaria = this.add.image(width/2, height/2 + 40, 'btnMaquinaria').setInteractive().setScale(0.6);
  const btnInfo = this.add.image(width/2, height/2 + 140, 'btnInfo').setInteractive().setScale(0.6);

  const stopMenu = () => {
    if (window.menuMusic && window.menuMusic.isPlaying) window.menuMusic.stop();
  };

  btnCamion.on('pointerdown', () => { stopMenu(); this.scene.start('GameScene'); });
  btnMaquinaria.on('pointerdown', () => { stopMenu(); this.scene.start('MaquinariaScene'); });
  btnInfo.on('pointerdown', () => openModal('instructionsModal'));

  // por si alguien cambia de escena con teclado/evento
  this.events.on('shutdown', () => { if (window.menuMusic && window.menuMusic.isPlaying) window.menuMusic.stop(); });
  this.events.on('sleep', () => { if (window.menuMusic && window.menuMusic.isPlaying) window.menuMusic.stop(); });
}



}
