
function startPhaser() {
  if (!window.game) {
    window.game = new Phaser.Game(config);
  } else {
    // si ya existe, solo cambia de escena si quieres
    window.game.scene.start('StartScene');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxUt6tND5SyxA8_C5h2FnlLXm7dpMAKb7-ZVe7d2tyvHK1fIPJjqEG-NxG42R3wPM-w_g/exec";

  async function postForm(url, data) {
    const body = new URLSearchParams(data).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { status: 'ok', raw: text }; }
  }

  if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    if (btn.disabled) return; 
    btn.disabled = true;
    btn.textContent = "Registrando...";

    const name  = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const company = document.getElementById("company").value.trim();

    
    if (!name || !email || !phone) {
      alert("Por favor completa todos los campos.");
      btn.disabled = false;
      btn.textContent = "Comenzar";
      return;
    }

    try {
      await postForm(WEBAPP_URL, { name, email, phone, company });
      localStorage.setItem("playerName", name);

      
      document.getElementById("registerModal").style.display = "none";
      startPhaser();
    } catch (err) {
      console.error("❌ Error guardando en Sheets:", err);
      alert("Ocurrió un error al registrar. Intenta nuevamente.");
      btn.disabled = false;
      btn.textContent = "Comenzar";
    }
  });
}

});

// Reiniciar desde el modal de Game Over
window.restartGame = function () {
  const modal = document.getElementById("gameOverModal");
  if (modal) modal.style.display = "none";

  if (window.game) {
    // Reinicia la escena de juego limpia
    window.game.scene.stop("GameScene");
    window.game.scene.start("GameScene");
  }
};



const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 1080,
  backgroundColor: '#000',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [
    StartScene,     
    GameScene,      
    MaquinariaScene 
  ]
};

window.restartTruck = function () {
  const modal = document.getElementById('gameOverTruckModal');
  if (modal) modal.style.display = 'none';
  if (window.game) {
    window.game.scene.stop('GameScene');
    window.game.scene.start('GameScene');
  }
};

// 🔁 Reiniciar maquinaria
window.restartMaquinaria = function () {
  const modal = document.getElementById("gameOverMaquinariaModal");
  if (modal) modal.style.display = "none";
  if (window.game) {
    window.game.scene.stop("MaquinariaScene");
    window.game.scene.start("MaquinariaScene");
  }
};

window.goToMenu = function () {
  if (window.game) {
    // cierra ambos modales por si acaso
    const m1 = document.getElementById('gameOverTruckModal');
    const m2 = document.getElementById('gameOverMaquinariaModal');
    if (m1) m1.style.display = 'none';
    if (m2) m2.style.display = 'none';
    window.game.scene.stop('GameScene');
    window.game.scene.stop('MaquinariaScene');
    window.game.scene.start('StartScene');
  }
};


