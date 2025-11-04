class MaquinariaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MaquinariaScene' });
  }

  preload() {
    
    this.load.image('platformTile', 'assets/platformTile.png');
    this.load.image('machineIdle', 'assets/machineIdle.png');
    this.load.image('machineCarrying', 'assets/machineCarrying.png');
    this.load.image('dumpTruckEmpty', 'assets/dumpTruckEmpty.png');
    this.load.image('dumpTruckLoaded', 'assets/dumpTruckLoaded.png');
    this.load.image('stone', 'assets/stone.png');
    this.load.image('sand', 'assets/sand.png');
    this.load.image('waste', 'assets/waste.png');
    this.load.image('wood', 'assets/wood.png');
    this.load.image('btnPick', 'assets/btnPick.png');
    this.load.image('btnDrop', 'assets/btnDrop.png');
    this.load.audio('engine', 'assets/sounds/engine.mp3');
    this.load.audio('pickupItem', 'assets/sounds/pickupItem.mp3');
    this.load.audio('dropItem', 'assets/sounds/dropItem.mp3');
    this.load.audio('bonusTime', 'assets/sounds/bonusTime.mp3');
    this.load.audio('gameoverSound', 'assets/sounds/gameover.mp3');


  }

  create() {

    const { width, height } = this.scale;

    // Fondo
    const bg = this.add.image(width / 2, height / 2, 'fondo');
    bg.setDisplaySize(width, height);

    // Piso / plataforma
    this.platform = this.add.tileSprite(width / 2, height / 2, width, height, 'platformTile');

    // Excavadora
    this.machine = this.physics.add.sprite(width / 2, height - 150, 'machineIdle');
    this.machine.setScale(0.8);
    this.machine.setCollideWorldBounds(true);

    // Volqueta (meta)
    this.dumpTruck = this.physics.add.sprite(width / 2, 100, 'dumpTruckEmpty');
    this.dumpTruck.setScale(0.8);
    this.dumpTruck.setImmovable(true);

    // Grupo de materiales
    this.materials = this.physics.add.group();

    // Zonas posibles (posiciones aleatorias dentro del mapa)
    this.spawnZones = [
      { x: 100, y: 300 }, { x: 300, y: 350 },
      { x: 200, y: 450 }, { x: 100, y: 550 },
      { x: 300, y: 600 }, { x: 200, y: 700 }
    ];

    // Genera los primeros 4 materiales (uno de cada tipo)
    this.spawnInitialMaterials();

    // Colisiones
    this.physics.add.overlap(this.machine, this.materials, this.pickMaterial, null, this);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Botones táctiles
    this.createButtons();
    // Permitir soltar con la tecla Espacio
    this.input.keyboard.on('keydown-SPACE', () => this.handleDrop());
    // Permitir recoger con la tecla Espacio
    this.input.keyboard.on('keydown-SPACE', () => this.handlePick());



    // Estado
    this.score = 0;
    this.timeLeft = 60;
    this.carrying = false;
    this.currentMaterial = null;

    // Objetivo inicial
    this.targetType = Phaser.Utils.Array.GetRandom(['stone', 'sand', 'waste', 'wood']);
    this.targetText = this.add.text(10, 40, `Recolecta: ${this.getEmoji(this.targetType)}`, {
      fontSize: '20px', fill: '#fff'
    });

    // UI
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', { fontSize: '18px', fill: '#fff' });
    this.timerText = this.add.text(width - 100, 10, '60s', { fontSize: '18px', fill: '#fff' });

    // Temporizador
    this.time.addEvent({
      delay: 1000,
      callback: () => this.updateTimer(),
      loop: true
    });

    // 🔊 Sonidos del juego
  this.engineSound = this.sound.add('engine', { loop: true, volume: 0.3 });
  this.pickupSound = this.sound.add('pickupItem', { volume: 0.6 });
  this.dropSound = this.sound.add('dropItem', { volume: 0.6 });
  this.bonusSound = this.sound.add('bonusTime', { volume: 0.7 });

  // Reproducir motor al iniciar
  this.engineSound.play();
  }

  // 🟢 Genera los 4 materiales iniciales (uno por tipo)
  spawnInitialMaterials() {
    const types = ['stone', 'sand', 'waste', 'wood'];

    // Limpia materiales previos
    this.materials.clear(true, true);

    // Genera uno de cada tipo en posiciones únicas
    types.forEach(type => this.spawnMaterial(type));
  }

  // 🟢 Crea un material en una zona libre aleatoria
spawnMaterial(type) {
  // Evita zonas ocupadas
  let freeZones = this.spawnZones.filter(zone => {
    return !this.materials.getChildren().some(mat => 
      Phaser.Math.Distance.Between(zone.x, zone.y, mat.x, mat.y) < 70
    );
  });

  // Si se agotaron zonas libres, usa todas y resetea
  if (freeZones.length === 0) freeZones = [...this.spawnZones];

  const zone = Phaser.Utils.Array.GetRandom(freeZones);
  const material = this.materials.create(zone.x, zone.y, type);
  material.setScale(0.6);
  material.setData('type', type);
  }

  createButtons() {
    const { width, height } = this.scale;

    this.pickBtn = this.add.image(width / 2 - 80, height - 80, 'btnPick')
      .setInteractive().setScale(0.7).setDepth(10);
    this.pickBtn.on('pointerdown', () => this.handlePick());

    this.dropBtn = this.add.image(width / 2 + 80, height - 80, 'btnDrop')
      .setInteractive().setScale(0.7).setDepth(10);
    this.dropBtn.on('pointerdown', () => this.handleDrop());
  }

  pickMaterial(machine, material) {
    this.pickupSound.play();
    if (!this.carrying) {
      this.carrying = true;
      this.currentMaterial = material.texture.key;
      const type = material.getData('type');
      material.destroy();
      this.machine.setTexture('machineCarrying');

      // volver a crear otro del mismo tipo en otra zona
      this.time.delayedCall(1000, () => this.spawnMaterial(type));
    }
  }

  handlePick() {
    const nearest = this.physics.closest(this.machine, this.materials.getChildren());
    if (nearest && Phaser.Math.Distance.BetweenPoints(this.machine, nearest) < 60) {
      this.pickMaterial(this.machine, nearest);
    }
  }

  handleDrop() {
  if (this.carrying && Phaser.Math.Distance.BetweenPoints(this.machine, this.dumpTruck) < 80) {
    if (this.currentMaterial === this.targetType) {
      this.score += 10;
      this.timeLeft += 3; // ⏱️ Bonificación de tiempo por entrega correcta
      this.bonusSound.play();
    } else {
      this.timeLeft -= 5; // Penalización si entrega mal
      this.dropSound.play(); // sonido de error o soltar
    }

    this.carrying = false;
    this.machine.setTexture('machineIdle');
    this.currentMaterial = null;

    // Actualizar texto de UI
    this.scoreText.setText(`Puntos: ${this.score}`);
    this.timerText.setText(`${this.timeLeft}s`);

    // Nuevo objetivo aleatorio
    this.targetType = Phaser.Utils.Array.GetRandom(['stone', 'sand', 'waste', 'wood']);
    this.targetText.setText(`Recolecta: ${this.getEmoji(this.targetType)}`);
  }
}


  updateTimer() {
    this.timeLeft--;
    this.timerText.setText(`${this.timeLeft}s`);

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

endGame() {
  if (this.gameOver) return; // Evita que se ejecute más de una vez
  this.gameOver = true;

  this.physics.pause();
  this.machine.setVelocity(0, 0);

  // 🔊 Reproducir sonido solo una vez
  if (!this.playedGameOverSound) {
    this.playedGameOverSound = true;
    this.sound.play('gameoverSound', { volume: 0.7 });
  }

  // Mostrar modal
  const modal = document.getElementById("gameOverMaquinariaModal");
  const scoreText = document.getElementById("maquinariaScoreText");
  if (scoreText) scoreText.innerText = `Puntaje final: ${this.score}`;
  if (modal) modal.style.display = "block";

  // Detener sonido del motor si está activo
  if (this.engineSound && this.engineSound.isPlaying) {
    this.engineSound.stop();
  }

  // Detener cualquier evento del temporizador
  this.time.removeAllEvents();
}



  getEmoji(type) {
    switch (type) {
      case 'stone': return '🪨 Piedra';
      case 'sand': return '🏖️ Arena';
      case 'waste': return '🗑️ Residuos';
      case 'wood': return '🪵 Madera';
      default: return '';
    }
  }

  update() {
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.machine.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.machine.setVelocityX(speed);
    } else {
      this.machine.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.machine.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.machine.setVelocityY(speed);
    } else {
      this.machine.setVelocityY(0);
    }

    this.machine.body.collideWorldBounds = true;
  }

  
}
