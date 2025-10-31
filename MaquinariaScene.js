class MaquinariaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MaquinariaScene' });
  }

  preload() {
    // Sprites principales
    this.load.image('platformTile', 'assets/platformTile.png');
    this.load.image('machineIdle', 'assets/machineIdle.png');
    this.load.image('machineCarrying', 'assets/machineCarrying.png');
    this.load.image('dumpTruckEmpty', 'assets/dumpTruckEmpty.png');
    this.load.image('dumpTruckLoaded', 'assets/dumpTruckLoaded.png');

    // Objetos
    this.load.image('stone', 'assets/stone.png');
    this.load.image('sand', 'assets/sand.png');
    this.load.image('waste', 'assets/waste.png');
    this.load.image('wood', 'assets/wood.png');

    // Botones
    this.load.image('btnPick', 'assets/btnPick.png');
    this.load.image('btnDrop', 'assets/btnDrop.png');
  }

  create() {
    const { width, height } = this.scale;

    // Fondo tileado de plataforma
    this.add.tileSprite(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 'platformTile');


    // Indicador de qué recoger
    this.targetItems = ['stone', 'sand', 'waste', 'wood'];
    this.currentTarget = Phaser.Utils.Array.GetRandom(this.targetItems);
    this.add.text(20, 20, `Recoge: ${this.currentTarget.toUpperCase()}`, {
      fontSize: '24px', fill: '#fff'
    });

    // Máquina
    this.machine = this.add.sprite(200, 700, 'machineIdle').setScale(1.2);
    this.isCarrying = false;

    // Volqueta
    this.dumpTruck = this.add.sprite(350, 700, 'dumpTruckEmpty').setScale(1.2);

    // Grupo de objetos que caen
    this.objects = this.physics.add.group();

    // Spawner de objetos
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        const type = Phaser.Utils.Array.GetRandom(this.targetItems);
        let obj = this.objects.create(Phaser.Math.Between(50, width-50), 0, type);
        obj.setVelocityY(200);
        obj.setDisplaySize(64, 64);
      }
    });

    // Controles con botones
    let btnPick = this.add.image(100, height-80, 'btnPick').setInteractive().setScale(0.5);
    let btnDrop = this.add.image(300, height-80, 'btnDrop').setInteractive().setScale(0.5);

    btnPick.on('pointerdown', () => this.pickItem());
    btnDrop.on('pointerdown', () => this.dropItem());

    // Puntaje
    this.score = 0;
    this.scoreText = this.add.text(20, 60, `Puntos: 0`, { fontSize: '20px', fill: '#fff' });

    // Física
    this.physics.add.overlap(this.machine, this.objects, (machine, obj) => {
      if (this.isPicking) {
        this.carryingItem = obj.texture.key;
        obj.destroy();
        this.machine.setTexture('machineCarrying');
        this.isCarrying = true;
        this.isPicking = false;
      }
    });
  }

  pickItem() {
    if (!this.isCarrying) {
      this.isPicking = true;
    }
  }

  dropItem() {
    if (this.isCarrying) {
      if (this.carryingItem === this.currentTarget) {
        this.score += 10;
      } else {
        this.score -= 5;
      }
      this.scoreText.setText(`Puntos: ${this.score}`);
      this.machine.setTexture('machineIdle');
      this.isCarrying = false;
      this.carryingItem = null;

      // Cambiar objetivo aleatorio
      this.currentTarget = Phaser.Utils.Array.GetRandom(this.targetItems);
    }
  }

  update() {
    // Mover objetos fuera de pantalla
    this.objects.children.iterate(obj => {
      if (obj && obj.y > this.scale.height) obj.destroy();
    });
  }
}
