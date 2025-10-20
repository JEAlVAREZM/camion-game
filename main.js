document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxUt6tND5SyxA8_C5h2FnlLXm7dpMAKb7-ZVe7d2tyvHK1fIPJjqEG-NxG42R3wPM-w_g/exec"; // <— pon tu URL exec aquí

  async function postForm(url, data) {
    // data = objeto plano -> lo convertimos a x-www-form-urlencoded
    const body = new URLSearchParams(data).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
    // Si tu WebApp responde con JSON, esto funcionará:
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
        const result = await postForm(WEBAPP_URL, {
          // type omitido => guardará en "players"
          name, email, phone
        });

        console.log("✅ Registro guardado en Google Sheets:", result);
        localStorage.setItem("playerName", name); // para usar luego al guardar score

        // Ocultar modal y arrancar el juego
        document.getElementById("registerModal").style.display = "none";
        new Phaser.Game(config);

      } catch (err) {
        console.error("❌ Error guardando en Google Sheets:", err);
        alert("No se pudo guardar el registro. Revisa la consola.");
      }
    });
  }
});

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
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


