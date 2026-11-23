

const productos = [
  "Doble Bacon",
  "Clásica Stock",
  "Triple Cheddar",
  "Big stock"
];

const beneficios = [
  "10% OFF",
  "Papas Extra",
  "Sin premio",
  "Gaseosa Gratis",
  "Sin premio",
  "15% OFF"
];

// Paleta Stock Burger (Rojo marca, Cian acento, Blanco y Neutros)
const coloresProductos = ["#ba0909", "#18181b", "#00a8e8", "#52525b"];
const coloresBeneficios = ["#00a8e8", "#ba0909", "#e4e4e7", "#16a34a", "#e4e4e7", "#f59e0b"];

let anguloProd = 0;
let anguloBenef = 0;
let velProd = 0;
let velBenef = 0;
let girando = false;

let ultimoSectorProd = -1;
let ultimoSectorBenef = -1;

// Sistema de partículas para el confeti
let particulasConfeti = [];

function setup() {
  const contenedor = document.getElementById("contenedor-canvas");
  if (!contenedor) return;

  const ancho = Math.min(contenedor.offsetWidth || 620, 620);
  const alto = ancho < 480 ? ancho * 1.35 : ancho * 0.56;

  const canvas = createCanvas(ancho, alto);
  canvas.parent("contenedor-canvas");
  angleMode(DEGREES);
  textFont("sans-serif");
}

function windowResized() {
  const contenedor = document.getElementById("contenedor-canvas");
  if (!contenedor) return;

  const ancho = Math.min(contenedor.offsetWidth || 620, 620);
  const alto = ancho < 480 ? ancho * 1.35 : ancho * 0.56;
  resizeCanvas(ancho, alto);
}

function draw() {
  background(255);

  
  const esVertical = width < 480;
  const radio = esVertical ? width * 0.27 : width * 0.20;

  const x1 = esVertical ? width * 0.5 : width * 0.27;
  const y1 = esVertical ? height * 0.27 : height * 0.54;

  const x2 = esVertical ? width * 0.5 : width * 0.73;
  const y2 = esVertical ? height * 0.75 : height * 0.54;

  
  if (girando) {
    anguloProd = (anguloProd + velProd) % 360;
    anguloBenef = (anguloBenef + velBenef) % 360;

    velProd *= 0.982;
    velBenef *= 0.985;

    
    const sectorActualProd = obtenerIndiceGanador(anguloProd, productos.length);
    const sectorActualBenef = obtenerIndiceGanador(anguloBenef, beneficios.length);

    if (sectorActualProd !== ultimoSectorProd || sectorActualBenef !== ultimoSectorBenef) {
      ultimoSectorProd = sectorActualProd;
      ultimoSectorBenef = sectorActualBenef;
      if (typeof tocarTic === "function") tocarTic();
    }

   
    if (velProd < 0.12 && velBenef < 0.12) {
      velProd = 0;
      velBenef = 0;
      girando = false;

      const prodGanado = productos[sectorActualProd];
      const benefGanado = beneficios[sectorActualBenef];

      if (benefGanado !== "Sin premio") {
        lanzarConfeti();
      }

      if (typeof procesarFinDeJuego === "function") {
        procesarFinDeJuego(prodGanado, benefGanado);
      }
    }
  }

  
  dibujarRuleta(x1, y1, radio, anguloProd, productos, coloresProductos, "1. TU BURGER");
  dibujarRuleta(x2, y2, radio, anguloBenef, beneficios, coloresBeneficios, "2. TU BENEFICIO");

  
  actualizarYDibujarConfeti();
}

function dibujarRuleta(cx, cy, r, anguloBase, opciones, paleta, titulo) {
  push();
  // Título superior
  fill(24, 24, 27);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(Math.max(12, r * 0.14));
  text(titulo, cx, cy - r - 22);

  translate(cx, cy);

  const paso = 360 / opciones.length;

  push();
  rotate(anguloBase);
  for (let i = 0; i < opciones.length; i++) {
    const inicio = i * paso;
    const fin = inicio + paso;
    const colorHex = paleta[i % paleta.length];

    fill(colorHex);
    stroke(255);
    strokeWeight(2);
    arc(0, 0, r * 2, r * 2, inicio, fin, PIE);

   
    push();
    rotate(inicio + paso / 2);
    fill(colorHex === "#e4e4e7" ? 24 : 255);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(Math.max(10, r * 0.115));
    text(opciones[i], r * 0.86, 0);
    pop();
  }
  pop();

 
  fill(255);
  stroke("#ba0909");
  strokeWeight(3);
  circle(0, 0, r * 0.24);

 
  fill("#ba0909");
  noStroke();
  triangle(-8, -r - 8, 8, -r - 8, 0, -r + 6);
  pop();
}

function obtenerIndiceGanador(anguloActual, cantidad) {
  const paso = 360 / cantidad;
 
  const anguloRelativo = (270 - (anguloActual % 360) + 360) % 360;
  return Math.floor(anguloRelativo / paso) % cantidad;
}


function iniciarGiroRuletas() {
  if (girando) return;
  velProd = random(18, 26);
  velBenef = random(22, 30);
  girando = true;
}


function lanzarConfeti() {
  particulasConfeti = [];
  const colores = ["#ba0909", "#00a8e8", "#facc15", "#16a34a", "#18181b"];
  for (let i = 0; i < 90; i++) {
    particulasConfeti.push({
      x: random(width * 0.2, width * 0.8),
      y: random(-40, height * 0.3),
      vx: random(-3, 3),
      vy: random(1.5, 4.5),
      tam: random(6, 11),
      rot: random(360),
      vRot: random(-6, 6),
      color: random(colores)
    });
  }
}

function actualizarYDibujarConfeti() {
  for (let i = particulasConfeti.length - 1; i >= 0; i--) {
    const p = particulasConfeti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vRot;

    push();
    translate(p.x, p.y);
    rotate(p.rot);
    fill(p.color);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, p.tam, p.tam * 0.6);
    pop();

    if (p.y > height + 20) {
      particulasConfeti.splice(i, 1);
    }
  }
}