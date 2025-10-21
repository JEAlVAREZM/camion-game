// Arranque del juego SOLO una vez (después de registro)
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
    // intenta leer JSON, pero no bloquees si no se puede
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { status: 'ok', raw: text }; }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name  = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;

      try {
        await postForm(WEBAPP_URL, { name, email, phone }); // registra al jugador
        localStorage.setItem("playerName", name);
      } catch (err) {
        console.error("❌ Error guardando en Sheets:", err);
      }

      // arrancar juego pase lo que pase
      document.getElementById("registerModal").style.display = "none";
      startPhaser();
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
  width: 1920,
  height: 1080,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [StartScene, GameScene]
};

function restartGame() {
  document.getElementById("gameOverModal").style.display = "none";
  if (window.game) {
    window.game.scene.stop("GameScene");
    window.game.scene.start("GameScene"); // reinicia directo en la escena de juego
  }
}


