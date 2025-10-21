class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
  this.add.image(960, 540, 'fondo').setDisplaySize(1920, 1080);

  this.lanes = [700, 960, 1220, 1480]; // 4 carriles centrados en la carretera del fondo
  this.currentLane = 1;

  this.truck = this.physics.add.sprite(this.lanes[this.currentLane], 900, 'truck');
  this.truck.setDisplaySize(120, 200);
  this.truck.setCollideWorldBounds(true);

  this.cargos = this.physics.add.group();
  this.obstacles = this.physics.add.group();
  this.cyclists = this.physics.add.group();
  this.holes = this.physics.add.group();

  this.cursors = this.input.keyboard.createCursorKeys();

  this.scoreText = this.add.text(50, 30, "Puntos: 0", {
    fontSize: "32px",
    fill: "#fff",
    fontFamily: "'Press Start 2P'"
  });

  // Eventos
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
  if (this.gameOver) return;

  if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.currentLane > 0) {
    this.currentLane--;
    this.truck.x = this.lanes[this.currentLane];
  }
  if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.currentLane < this.lanes.length - 1) {
    this.currentLane++;
    this.truck.x = this.lanes[this.currentLane];
  }
}

update() {
  if (this.gameOver) return;

  // carretera en movimiento
  this.road.tilePositionY -= 6; // un pelín más rápido por altura 800

  // movimiento entre carriles
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
  let lane = Phaser.Math.Between(0, this.lanes.length - 1);
  let cargo = this.cargos.create(this.lanes[lane], -50, 'cargo');
  cargo.setVelocityY(400);
  cargo.setDisplaySize(70, 70);
}

 dropObstacle() {
  if (this.gameOver) return;
  let lane = Phaser.Math.Between(0, this.lanes.length - 1);
  let obstacle = this.obstacles.create(this.lanes[lane], -50, 'obstacle');
  obstacle.setVelocityY(450);
  obstacle.setDisplaySize(70, 70);
}

 dropCyclist() {
  if (this.gameOver) return;
  let lane = Phaser.Math.Between(0, this.lanes.length - 1);
  let cyclist = this.cyclists.create(this.lanes[lane], -50, 'cyclist');
  cyclist.setVelocityY(380);
  cyclist.setDisplaySize(120, 200);
}

 dropHole() {
  if (this.gameOver) return;
  let lane = Phaser.Math.Between(0, this.lanes.length - 1);
  let hole = this.holes.create(this.lanes[lane], -50, 'hole');
  hole.setVelocityY(420);
  hole.setDisplaySize(100, 100);
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
  const scoreEl = document.getElementById("finalScore");      // asegúrate que en index.html se llame finalScore
  const modalEl = document.getElementById("gameOverModal");

  if (msgEl)   msgEl.innerText = message;
  if (scoreEl) scoreEl.innerText = "Puntaje final: " + this.score;
  if (modalEl) modalEl.style.display = "flex";

  // 👉 Guardar puntaje SIN await (que no bloquee el flujo)
  try {
    const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxUt6tND5SyxA8_C5h2FnlLXm7dpMAKb7-ZVe7d2tyvHK1fIPJjqEG-NxG42R3wPM-w_g/exec"; // tu URL
    const name = localStorage.getItem("playerName") || "Jugador";

    const body = new URLSearchParams({
      type: 'score',
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
