// loaderScene.js
class LoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoaderScene' });
  }

  preload() {
    // Fondo / escenario
    this.load.image('groundTile', 'assets/groundTile.png');
    this.load.image('warehouse', 'assets/warehouse.png');
    this.load.image('dock', 'assets/dock.png');

    // Vehículos
    this.load.image('dumpTruck', 'assets/dumpTruck.png');
    this.load.image('excavator', 'assets/excavator.png');

    // (opcionales para ambientar)
    this.load.image('cargoBox', 'assets/cargoBox.png');
    this.load.image('pallet', 'assets/pallet.png');
    this.load.image('barrel', 'assets/barrel.png');
    this.load.image('bigRock', 'assets/bigRock.png');
  }

  create() {
    const { width: W, height: H } = this.scale;

    // === Suelo con tile repetible ===
    // Usa tileSprite para cubrir la pantalla con groundTile (top-down)
    const tile = this.add.tileSprite(W/2, H/2, W, H, 'groundTile');
    tile.setTileScale(1, 1);

    // === Decorado/Meta ===
    // Warehouse al tope derecho
    const wh = this.add.image(W * 0.86, H * 0.22, 'warehouse').setOrigin(0.5);
    wh.setDisplaySize(256, 256);

    // Dock donde se descarga (a la derecha)
    this.dock = this.add.image(W * 0.78, H * 0.65, 'dock').setOrigin(0.5);
    // Ajusta al tamaño real de tu sprite:
    this.dock.setDisplaySize(256, 128);

    // === Volqueta estacionada junto al dock ===
    this.truck = this.physics.add.image(W * 0.78, H * 0.60, 'dumpTruck').setOrigin(0.5, 0.5);
    // Ajusta a tu sprite real
    this.truck.setDisplaySize(220, 110);
    this.truck.setImmovable(true);

    // === Excavadora controlable (jugador) ===
    this.excavator = this.physics.add.image(W * 0.28, H * 0.62, 'excavator');
    this.excavator.setDisplaySize(150, 150);
    this.excavator.setCollideWorldBounds(true);

    // === “Pilón” de material (tierra) para cargar: lo pintamos con Graphics ===
    this.pile = this.add.graphics();
    this.pile.fillStyle(0x8d6e63, 1); // marrón tierra
    this.pileCircle = new Phaser.Geom.Circle(W * 0.25, H * 0.70, 90);
    this.pile.fillCircleShape(this.pileCircle);

    // Opcional: cajas cerca del pile como adorno
    // this.add.image(W*0.23, H*0.60, 'cargoBox').setDisplaySize(40,40);
    // this.add.image(W*0.27, H*0.60, 'cargoBox').setDisplaySize(40,40);

    // === HUD / Estado ===
    this.timeLimit = 60; // s
    this.timeLeft  = this.timeLimit;
    this.bucketCap = 5;  // paladas max en balde
    this.bucketQty = 0;  // lo que llevas
    this.truckFill = 0;  // 0..100 %
    this.score     = 0;
    this.gameOver  = false;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyScoop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // cargar
    this.keyDump  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);     // descargar

    this.ui = this.add.text(24, 24, '', { fontSize: '22px', fill: '#fff' });
    this.add.text(24, H - 64, 'Controles: ← → ↑ ↓ mover | SPACE: Cargar | D: Descargar', { fontSize: '18px', fill: '#e0f7fa' });

    // Barra de llenado de la tolva
    this.fillBg  = this.add.rectangle(this.truck.x, this.truck.y + 90, 300, 16, 0x222222).setStrokeStyle(2, 0xffffff);
    this.fillBar = this.add.rectangle(this.truck.x - 150, this.truck.y + 90, 0, 14, 0x00e676).setOrigin(0, 0.5);

    // Temporizador
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.endGame('⏱️ Tiempo agotado');
        }
      }
    });

    // Foco visual al área del dock (opcional)
    // this.add.text(this.dock.x, this.dock.y - 80, 'Zona de Descarga', { fontSize:'18px', fill:'#ffeb3b' }).setOrigin(0.5);
  }

  update() {
    if (this.gameOver) return;

    const speed = 260;
    this.excavator.setVelocity(0);

    if (this.cursors.left.isDown)  this.excavator.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.excavator.setVelocityX(speed);
    if (this.cursors.up.isDown)    this.excavator.setVelocityY(-speed);
    if (this.cursors.down.isDown)  this.excavator.setVelocityY(speed);

    // Cargar (SPACE) si está cerca del pilón
    if (Phaser.Input.Keyboard.JustDown(this.keyScoop)) {
      const dist = Phaser.Math.Distance.Between(this.excavator.x, this.excavator.y, this.pileCircle.x, this.pileCircle.y);
      if (dist <= this.pileCircle.radius + 40) {
        if (this.bucketQty < this.bucketCap) {
          this.bucketQty++;
          this.score += 5;
          // TODO: this.sound.play('scoop');
        }
      }
    }

    // Descargar (D) si está sobre el dock/camión
    if (Phaser.Input.Keyboard.JustDown(this.keyDump)) {
      // Caja del dock / truck
      const area = new Phaser.Geom.Rectangle(this.dock.x - 128, this.dock.y - 64, 256, 128);
      if (Phaser.Geom.Rectangle.Contains(area, this.excavator.x, this.excavator.y)) {
        if (this.bucketQty > 0) {
          this.truckFill = Phaser.Math.Clamp(this.truckFill + this.bucketQty * 6, 0, 100);
          this.score += this.bucketQty * 10; // recompensa por descargar
          this.bucketQty = 0;
          // TODO: this.sound.play('dump');
        }
      }
    }

    // HUD
    this.ui.setText(`⏱️ ${this.timeLeft}s    🪣 Balde: ${this.bucketQty}/${this.bucketCap}    🚚 Carga Volqueta: ${this.truckFill}%    ⭐ ${this.score}`);
    this.fillBar.width = (this.truckFill / 100) * 300;

    if (this.truckFill >= 100) {
      this.endGame('✅ ¡Volqueta llena!');
    }
  }

  endGame(message) {
    this.gameOver = true;

    // Si tienes modal HTML (gameOverModal), lo usamos:
    const modal = document.getElementById('gameOverModal');
    const msgEl = document.getElementById('gameOverMessage');
    const scoreEl = document.getElementById('finalScore') || document.getElementById('gameOverScore');

    if (modal && msgEl) {
      msgEl.innerText = message;
      if (scoreEl) scoreEl.innerText = 'Puntaje final: ' + this.score;
      modal.style.display = 'flex';
    } else {
      // fallback en pantalla
      const { width: W, height: H } = this.scale;
      this.add.rectangle(W/2, H/2, 520, 220, 0x000000, 0.7);
      this.add.text(W/2, H/2 - 40, 'GAME OVER', { fontSize:'40px', fill:'#ff4444' }).setOrigin(0.5);
      this.add.text(W/2, H/2 + 10, message, { fontSize:'22px', fill:'#fff' }).setOrigin(0.5);
      this.add.text(W/2, H/2 + 50, `Puntaje final: ${this.score}`, { fontSize:'22px', fill:'#fff' }).setOrigin(0.5);

      const bt = this.add.text(W/2, H/2 + 100, 'Volver al menú', { fontSize:'20px', fill:'#00e676', backgroundColor:'#111', padding:{x:10,y:6} })
        .setOrigin(0.5).setInteractive();
      bt.on('pointerdown', () => this.scene.start('StartScene'));
    }
  }
}
