class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameOverPlayed = false;
    this.gameOverSfx = this.sound.add('gameoverSound', { loop: false, volume: 0.7 });

    this.bgMusic = this.sound.add('music', { volume: 0.5, loop: true });
    this.bgMusic.play();
    
    this.score = 0;
    this.coneHits = 0;
    this.holeHits = 0;
    this.gameOver = false;

    this.lanes = [70, 160, 250, 340];
    this.currentLane = 1;

    this.road = this.add.tileSprite(
    this.sys.game.config.width / 2,  // Centrado en X
    this.sys.game.config.height / 2, // Centrado en Y
    this.sys.game.config.width,      // Ancho del canvas
    this.sys.game.config.height,     // Alto del canvas
    'road'
    );


    this.truck = this.physics.add.sprite(this.lanes[this.currentLane], 500, 'truck');
    this.truck.setDisplaySize(64, 128);
    this.truck.setCollideWorldBounds(true);

    this.cargos = this.physics.add.group();
    this.obstacles = this.physics.add.group();
    this.cyclists = this.physics.add.group();
    this.holes = this.physics.add.group();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.scoreText = this.add.text(10, 10, 'Puntos: 0', { fontSize: '20px', fill: '#fff' });

    // Textos de game over (ocultos inicialmente)
    this.gameOverText = this.add.text(200, 250, '', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5).setVisible(false);
    this.restartText = this.add.text(200, 300, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5).setVisible(false);

    this.restartText.on('pointerdown', () => {
      this.scene.start('StartScene');
    });

    // Eventos de spawn
    this.time.addEvent({ delay: 1500, callback: () => this.dropCargo(), loop: true });
    this.time.addEvent({ delay: 2000, callback: () => this.dropObstacle(), loop: true });
    this.time.addEvent({ delay: 5000, callback: () => this.dropCyclist(), loop: true });
    this.time.addEvent({ delay: 3500, callback: () => this.dropHole(), loop: true });

    // Colisiones
    this.physics.add.overlap(this.truck, this.cargos, (t, c) => this.collectCargo(c), null, this);
    this.physics.add.overlap(this.truck, this.obstacles, (t, o) => this.hitObstacle(o), null, this);
    this.physics.add.overlap(this.truck, this.cyclists, (t, c) => this.hitCyclist(c), null, this);
    this.physics.add.overlap(this.truck, this.holes, (t, h) => this.hitHole(h), null, this);
  }



  update() {
    this.road.tilePositionY -= 5; // mueve la carretera
    if (this.gameOver) return;

    this.road.tilePositionY -= 5;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.currentLane > 0) {
      this.currentLane--;
      this.truck.x = this.lanes[this.currentLane];
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.truck.x = this.lanes[this.currentLane];
    }
  }

  // Spawners
  dropCargo() {
    if (this.gameOver) return;
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    let cargo = this.cargos.create(this.lanes[lane], 0, 'cargo');
    cargo.setVelocityY(200);
    cargo.setDisplaySize(48, 48);
  }

  dropObstacle() {
    if (this.gameOver) return;
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    let obstacle = this.obstacles.create(this.lanes[lane], 0, 'obstacle');
    obstacle.setVelocityY(220);
    obstacle.setDisplaySize(48, 48);
  }

  dropCyclist() {
    if (this.gameOver) return;
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    let cyclist = this.cyclists.create(this.lanes[lane], 0, 'cyclist');
    cyclist.setVelocityY(180);
    cyclist.setDisplaySize(64, 128);
  }

  dropHole() {
    if (this.gameOver) return;
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    let hole = this.holes.create(this.lanes[lane], 0, 'hole');
    hole.setVelocityY(200);
    hole.setDisplaySize(64, 64);
  }

  // Colisiones
  collectCargo(cargo) {
    cargo.destroy();
    this.sound.play('pickup', { volume: 0.7 });
    this.score += 10;
    this.scoreText.setText('Puntos: ' + this.score);
  }

  hitObstacle(obstacle) {
    obstacle.destroy();
    this.coneHits++;
    this.sound.play('crash', { volume: 1 });
    this.score -= 20;
    this.scoreText.setText('Puntos: ' + this.score);
    if (this.coneHits >= 3) this.endGame("🚧 Demasiados conos");
  }

  hitCyclist(cyclist) {
    cyclist.destroy();
    this.sound.play('gameoverSound', { volume: 1 });
    this.endGame("❌ Atropellaste a un ciclista");
  }

  hitHole(hole) {
    hole.destroy();
    this.sound.play('holeSound', { volume: 0.8 });
    this.holeHits++;
    this.score -= 15;
    this.scoreText.setText('Puntos: ' + this.score);
    if (this.holeHits >= 2) this.endGame("🕳️ Demasiados huecos");
  }

async endGame(message) {
  this.gameOver = true;

  if (this.bgMusic) this.bgMusic.stop();

  this.truck.setVelocity(0);
  this.cargos.clear(true, true);
  this.obstacles.clear(true, true);
  this.cyclists.clear(true, true);
  this.holes.clear(true, true);

  // 👉 Mostrar modal HTML (no dependas de la red)
  const msgEl   = document.getElementById("gameOverMessage");
  const scoreEl = document.getElementById("truckScoreText");
  const modalEl = document.getElementById("gameOverTruckModal");

  if (msgEl)   msgEl.innerText = message || "🚧 Game Over";
  if (scoreEl) scoreEl.innerText = `Puntaje final: ${this.score}`;
  if (modalEl) modalEl.style.display = "flex";

  // 👉 Guardar puntaje SIN await (no bloquea el flujo)
  try {
    const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxUt6tND5SyxA8_C5h2FnlLXm7dpMAKb7-ZVe7d2tyvHK1fIPJjqEG-NxG42R3wPM-w_g/exec";
    const name = localStorage.getItem("playerName") || "Jugador";

  const body = new URLSearchParams({
    type: 'score',
    gameType: 'camion',
    name,
    score: String(this.score)
  }).toString();

    fetch(WEBAPP_URL, { 
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    }).catch(err => console.error("❌ Error guardando puntaje en Sheets:", err));

  } catch (err) {
    console.error("❌ Error guardando puntaje en Sheets:", err);
  }
}


}
