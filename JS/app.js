

let audioCtx = null;
let audioSilenciado = false;
const NUMERO_WSP = "5491122783946";

function activarAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended" && !audioSilenciado) {
    audioCtx.resume();
  }
}

function tocarTic() {
  if (audioSilenciado) return;
  activarAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(650, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
}

function tocarSonidoGano() {
  if (audioSilenciado) return;
  activarAudio();
  const notas = [523.25, 659.25, 783.99, 1046.5]; // Do - Mi - Sol - Do agudo
  notas.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.25);
  });
}

function tocarSonidoNada() {
  if (audioSilenciado) return;
  activarAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.32);
}

// Llamada automáticamente por sketch.js cuando frenan ambas ruletas
function procesarFinDeJuego(producto, beneficio) {
  const gano = beneficio !== "Sin premio";
  if (gano) {
    tocarSonidoGano();
  } else {
    tocarSonidoNada();
  }

  const jugada = { producto, beneficio, gano };
  localStorage.setItem("stockBurger_ultimaJugada", JSON.stringify(jugada));
  mostrarResultadoEnPantalla(jugada);

  const btnGirar = document.getElementById("btn-girar");
  if (btnGirar) btnGirar.disabled = false;
}

function mostrarResultadoEnPantalla(jugada) {
  const panel = document.querySelector(".panel-juego");
  const texto = document.getElementById("resultado-texto");
  const btnReclamar = document.getElementById("btn-reclamar");
  if (!panel || !texto || !btnReclamar) return;

  if (jugada.gano) {
    panel.dataset.estado = "gano";
    texto.textContent = `🎉 ¡Tocó ${jugada.producto} + ${jugada.beneficio}!`;
    const msg = encodeURIComponent(
      `Hola Stock Burger! Jugué en la web y me tocó: ${jugada.producto} con ${jugada.beneficio}. Quiero pedirlo!`
    );
    btnReclamar.href = `https://wa.me/${NUMERO_WSP}?text=${msg}`;
    btnReclamar.textContent = `Reclamar ${jugada.producto} + ${jugada.beneficio}`;
  } else {
    panel.dataset.estado = "sin-premio";
    texto.textContent = `🍔 Te recomendamos pedir: ${jugada.producto} (esta vez sin beneficio extra).`;
    const msg = encodeURIComponent(
      `Hola Stock Burger! La ruleta me recomendó pedir: ${jugada.producto}.`
    );
    btnReclamar.href = `https://wa.me/${NUMERO_WSP}?text=${msg}`;
    btnReclamar.textContent = `Pedir ${jugada.producto} por WhatsApp`;
  }

  btnReclamar.classList.remove("oculto");
}

// --- INICIALIZACIÓN SEGURA AL CARGAR EL DOM ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Si estamos en index.html, actualizar estado abierto/cerrado (miércoles a domingo 20:00 a 23:00)
  const tarjetaEstado = document.getElementById("tarjeta-estado");
  if (tarjetaEstado) {
    const ahora = new Date();
    const dia = ahora.getDay(); // 0 = Dom, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb
    const hora = ahora.getHours();
    const esDiaAtencion = dia === 0 || (dia >= 3 && dia <= 6);
    const esHorarioAtencion = hora >= 20 && hora < 23;

    const abierto = esDiaAtencion && esHorarioAtencion;
    tarjetaEstado.dataset.estado = abierto ? "abierto" : "cerrado";
    const textoEstado = tarjetaEstado.querySelector(".estado-texto");
    if (textoEstado) {
      textoEstado.textContent = abierto
        ? "🟢 ¡ESTAMOS ABIERTOS! Tomando pedidos hasta las 23:00 hs."
        : "🔴 CERRADO AHORA · Abrimos de miércoles a domingos de 20:00 a 23:00 hs.";
    }
  }

  // 2. Si estamos en segunda.html, conectar botones y recuperar estado previo de localStorage
  const btnGirar = document.getElementById("btn-girar");
  const btnSilenciar = document.getElementById("btn-silenciar");

  if (btnGirar) {
    const guardada = localStorage.getItem("stockBurger_ultimaJugada");
    if (guardada) {
      try {
        mostrarResultadoEnPantalla(JSON.parse(guardada));
      } catch (e) {
        localStorage.removeItem("stockBurger_ultimaJugada");
      }
    }

    btnGirar.addEventListener("click", () => {
      activarAudio();
      btnGirar.disabled = true;
      if (typeof iniciarGiroRuletas === "function") {
        iniciarGiroRuletas();
      }
    });
  }

  if (btnSilenciar) {
    btnSilenciar.addEventListener("click", () => {
      audioSilenciado = !audioSilenciado;
      btnSilenciar.setAttribute("aria-pressed", String(audioSilenciado));
      btnSilenciar.textContent = audioSilenciado ? "🔇 Sonido silenciado" : "🔊 Sonido activado";
    });
  }
});