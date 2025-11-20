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
    // Reinicio de variables al empezar un nuevo intento
    this.gameOver = false;
    this.playedGameOverSound = false;
    this.time.removeAllEvents();

    // 🔊 Sonidos del juego
  this.engineSound = this.sound.add('engine', { loop: true, volume: 0.3 });
  this.pickupSound = this.sound.add('pickupItem', { volume: 0.6 });
  this.dropSound = this.sound.add('dropItem', { volume: 0.6 });
  this.bonusSound = this.sound.add('bonusTime', { volume: 0.7 });

  // Reproducir motor al iniciar
  this.engineSound.play();
  }

  spawnInitialMaterials() {
    const types = ['stone', 'sand', 'waste', 'wood'];

    this.materials.clear(true, true);

    types.forEach(type => this.spawnMaterial(type));
  }

spawnMaterial(type) {
  let freeZones = this.spawnZones.filter(zone => {
    return !this.materials.getChildren().some(mat => 
      Phaser.Math.Distance.Between(zone.x, zone.y, mat.x, mat.y) < 70
    );
  });

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

    this.scoreText.setText(`Puntos: ${this.score}`);
    this.timerText.setText(`${this.timeLeft}s`);

    this.targetType = Phaser.Utils.Array.GetRandom(['stone', 'sand', 'waste', 'wood']);
    this.targetText.setText(`Recolecta: ${this.getEmoji(this.targetType)}`);
  }
}


  updateTimer() {
  if (this.gameOver) return;
  this.timeLeft--;
  this.timerText.setText(`${this.timeLeft}s`);
  if (this.timeLeft <= 0) {
    this.endGame();
  }
}


async endGame() {
  this.physics.pause();
  this.machine.setVelocity(0, 0);

  // Mostrar modal
  const modal = document.getElementById("gameOverMaquinariaModal");
  const scoreText = document.getElementById("maquinariaScoreText");
  if (scoreText) scoreText.innerText = `Puntaje final: ${this.score}`;
  if (modal) modal.style.display = "flex";

  // 🎯 Enviar puntaje al Google Sheet
  try {
    const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxUt6tND5SyxA8_C5h2FnlLXm7dpMAKb7-ZVe7d2tyvHK1fIPJjqEG-NxG42R3wPM-w_g/exec";
    const name = localStorage.getItem("playerName") || "Jugador";

    
  const body = new URLSearchParams({
    type: 'score',
    gameType: 'maquinaria',
    name,
    score: String(this.score)
  }).toString();

    await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });

    console.log("✅ Puntaje maquinaria enviado correctamente");

  } catch (err) {
    console.error("❌ Error guardando puntaje maquinaria:", err);
  }
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
