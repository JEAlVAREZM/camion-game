const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update }
};

let truck, cursors, score = 0, scoreText, gameOverText, restartText;
let cargos, obstacles, cyclists, holes;
let road;
let lanes = [70, 160, 250, 340];
let currentLane = 1;

let coneHits = 0;   // CONTADOR DE CONOS
let holeHits = 0;   // CONTADOR DE HUECOS
let gameOver = false;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('road', 'assets/road.png');
    this.load.image('truck', 'assets/truck.png');
    this.load.image('cargo', 'assets/cargo.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('cyclist', 'assets/cyclist.png');
    this.load.image('hole', 'assets/hole.png');
}

function create() {
    //REINICIAR VARIABLES
    coneHits = 0;
    holeHits = 0;
    score = 0;
    gameOver = false;

    road = this.add.tileSprite(200, 300, 400, 600, 'road');

    truck = this.physics.add.sprite(lanes[currentLane], 500, 'truck');
    truck.setDisplaySize(64, 128);
    truck.setCollideWorldBounds(true);

    cargos = this.physics.add.group();
    obstacles = this.physics.add.group();
    cyclists = this.physics.add.group();
    holes = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(10, 10, 'PUNTOS: 0', { fontSize: '20px', fill: '#fff' });
    countObstacleText = this.add.text(10, 40, 'INFRACCIONES: 0', { fontSize: '20px', fill: '#fff' });
    countHoleText = this.add.text(10, 70, 'HUECOS: 0', { fontSize: '20px', fill: '#fff' });

    // TEXTOS
    gameOverText = this.add.text(200, 250, '', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5);
    restartText = this.add.text(200, 300, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5).setInteractive();

    restartText.on('pointerdown', () => {
        this.scene.restart(); // REINICIAR ESCENA
    });

    // EVENTOS
    this.time.addEvent({ delay: 1500, callback: dropCargo, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 2000, callback: dropObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 5000, callback: dropCyclist, callbackScope: this, loop: true }); // menos frecuente
    this.time.addEvent({ delay: 3500, callback: dropHole, callbackScope: this, loop: true });

    // COLISIONES
    this.physics.add.overlap(truck, cargos, collectCargo, null, this);
    this.physics.add.overlap(truck, obstacles, hitObstacle, null, this);
    this.physics.add.overlap(truck, cyclists, hitCyclist, null, this);
    this.physics.add.overlap(truck, holes, hitHole, null, this);
}

function update() {
    if (gameOver) return;

    road.tilePositionY -= 5;

    if (Phaser.Input.Keyboard.JustDown(cursors.left) && currentLane > 0) {
        currentLane--;
        truck.x = lanes[currentLane];
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.right) && currentLane < lanes.length - 1) {
        currentLane++;
        truck.x = lanes[currentLane];
    }
}

function dropCargo() {
    if (gameOver) return;
    const lane = Phaser.Math.Between(0, lanes.length - 1);
    let cargo = cargos.create(lanes[lane], 0, 'cargo');
    cargo.setVelocityY(200);
    cargo.setDisplaySize(48, 48);
}

function dropObstacle() {
    if (gameOver) return;
    const lane = Phaser.Math.Between(0, lanes.length - 1);
    let obstacle = obstacles.create(lanes[lane], 0, 'obstacle');
    obstacle.setVelocityY(220);
    obstacle.setDisplaySize(48, 48);
}

function dropCyclist() {
    if (gameOver) return;
    const lane = Phaser.Math.Between(0, lanes.length - 1);
    let cyclist = cyclists.create(lanes[lane], 0, 'cyclist');
    cyclist.setVelocityY(180);
    cyclist.setDisplaySize(64, 128);
}

function dropHole() {
    if (gameOver) return;
    const lane = Phaser.Math.Between(0, lanes.length - 1);
    let hole = holes.create(lanes[lane], 0, 'hole');
    hole.setVelocityY(200);
    hole.setDisplaySize(64, 64);
}

function collectCargo(truck, cargo) {
    cargo.destroy();
    score += 10;
    scoreText.setText('PUNTOS: ' + score);
}

function hitObstacle(truck, obstacle) {
    obstacle.destroy();
    coneHits++;
    score -= 20;
    scoreText.setText('PUNTOS: ' + score);

    if (coneHits >= 3) endGame.call(this, "🚧 CHOCASTE DEMASIADOS CONOS");
}

function hitCyclist(truck, cyclist) {
    cyclist.destroy();
    endGame.call(this, "ATROPELLASTE A UN CICLISTA");
}

function hitHole(truck, hole) {
    hole.destroy();
    holeHits++; 
    score -= 15;
    scoreText.setText('PUNTOS: ' + score);

    if (holeHits >= 2) endGame.call(this, "🕳️ CAÍSTE EN DEMASIADOS HUECOS");
}

function endGame(message) {
    gameOver = true;
    truck.setVelocity(0);
    cargos.clear(true, true);
    obstacles.clear(true, true);
    cyclists.clear(true, true);
    holes.clear(true, true);

    gameOverText.setText("GAME OVER\n" + message + "\nPUNTAJE FINAL: " + score);
    restartText.setText("HAZ CLICK PARA REINICIAR");
}
