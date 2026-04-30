const SENHA = "2026";

const jogos = {
  a: {
    titulo: "Imagem A — Plexo braquial e axila",
    subtitulo: "Plexo braquial e axila — vista anterior.",
    imagem: "a.png",
    gabarito: {
  1: "Reto abdominal",
  2: "Porção esternocostal do peitoral maior",
  3: "Porção clavicular do peitoral maior",
  4: "Corpo da clavícula",
  5: "Músculo subclávio",
  6: "Peitoral menor",
  7: "Músculo deltóide",
  8: "Peitoral maior (origem comum)",
  9: "Coracobraquial + cabeça curta do bíceps",
  10: "Cordão lateral do plexo braquial",
  11: "Artéria axilar",
  12: "Veia axilar",
  13: "Artéria torácica lateral",
  14: "Nervo musculocutâneo",
  15: "Nervo mediano",
  16: "Artéria braquial",
  17: "Nervo ulnar",
  18: "Nervo cutâneo medial do braço",
  19: "Músculo subescapular",
  20: "Nervo toracodorsal",
  21: "Linfonodo axilar",
  22: "Artéria toracodorsal",
  23: "Latíssimo do dorso",
  24: "Músculo redondo maior",
  25: "Serrátil anterior"
    }
  },

  b: {
    titulo: "Imagem B — Antebraço e palma",
    subtitulo: "Região anterior do antebraço, punho e palma da mão.",
    imagem: "b.png",
    gabarito: {
      1: "Pele do antebraço",
      2: "Veias superficiais no tecido subcutâneo",
      3: "Fáscia profunda do antebraço",
      4: "Ramos do nervo cutâneo medial do antebraço",
      5: "Músculo braquiorradial",
      6: "Artéria radial",
      7: "Flexor radial do carpo",
      8: "Flexor superficial dos dedos",
      9: "Nervo mediano",
      10: "Artéria ulnar",
      11: "Flexor ulnar do carpo",
      12: "Nervo ulnar",
      13: "Palmar longo",
      14: "Retináculo dos flexores",
      15: "Palmar curto",
      16: "Flexor curto do dedo mínimo",
      17: "Abdutor do dedo mínimo",
      18: "Parte central da aponeurose palmar",
      19: "Ramo recorrente do nervo mediano",
      20: "Abdutor curto do polegar",
      21: "Flexor curto do polegar",
      22: "Ramos digitais do nervo mediano",
      23: "Artérias digitais palmares comuns",
      24: "Bainha fibrosa do dedo médio",
      25: "Ramos digitais do nervo ulnar",
      26: "Artéria digital palmar própria"
    }
  }
};

let jogoAtual = "a";
let respostas = carregarRespostas();
let selecionado = null;
let zoom = 1;

const scoreText = document.getElementById("scoreText");
const chips = document.getElementById("chips");
const legendas = document.getElementById("legendas");
const resultado = document.getElementById("resultado");
const imagemAtual = document.getElementById("imagemAtual");
const tituloImagem = document.getElementById("tituloImagem");
const subImagem = document.getElementById("subImagem");
const totalBadge = document.getElementById("totalBadge");

function gabaritoAtual() {
  return jogos[jogoAtual].gabarito;
}

function storageKey() {
  return "respostas_dragdrop_" + jogoAtual;
}

function carregarRespostas() {
  return JSON.parse(localStorage.getItem("respostas_dragdrop_" + jogoAtual)) || {};
}

function salvar() {
  localStorage.setItem(storageKey(), JSON.stringify(respostas));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function trocarJogo(id) {
  jogoAtual = id;
  respostas = carregarRespostas();
  selecionado = null;
  zoom = 1;

  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.jogo === id));

  const jogo = jogos[id];
  imagemAtual.src = jogo.imagem;
  imagemAtual.style.transform = "scale(1)";
  tituloImagem.textContent = jogo.titulo;
  subImagem.textContent = jogo.subtitulo;

  const total = Object.keys(jogo.gabarito).length;
  totalBadge.textContent = total + " itens";
  scoreText.textContent = "0/" + total;
  resultado.textContent = "Aguardando respostas...";

  criarNumeros();
  criarLegendas();
}

function criarNumeros() {
  chips.innerHTML = "";
  const nums = Object.keys(gabaritoAtual());

  shuffle(nums).forEach(num => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = num;
    chip.draggable = true;
    chip.dataset.num = num;

    chip.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", num);
    });

    chip.addEventListener("click", () => {
      selecionado = num;
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
    });

    chips.appendChild(chip);
  });
}

function criarLegendas() {
  legendas.innerHTML = "";

  const entradas = Object.entries(gabaritoAtual()).map(([num, nome]) => ({ num, nome }));

  shuffle(entradas).forEach(item => {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.correto = item.num;

    const circle = document.createElement("div");
    circle.className = "circle";
    circle.textContent = respostas[item.num] || "";

    circle.addEventListener("dragover", e => e.preventDefault());

    circle.addEventListener("drop", e => {
      e.preventDefault();
      const num = e.dataTransfer.getData("text/plain");
      respostas[item.num] = num;
      salvar();
      criarLegendas();
    });

    circle.addEventListener("click", () => {
      if (!selecionado) {
        pulse(circle);
        return;
      }
      respostas[item.num] = selecionado;
      salvar();
      criarLegendas();
    });

    const text = document.createElement("div");
    text.className = "label";
    text.innerHTML = `<strong>${item.nome}</strong><span>solte o número aqui</span>`;

    row.appendChild(circle);
    row.appendChild(text);
    legendas.appendChild(row);
  });
}

function pulse(el) {
  el.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
    { duration: 260 }
  );
}

function corrigir() {
  let acertos = 0;
  const gab = gabaritoAtual();
  const total = Object.keys(gab).length;

  document.querySelectorAll(".row").forEach(row => {
    const correto = row.dataset.correto;
    const resp = respostas[correto];

    row.classList.remove("correct", "wrong");

    if (resp === correto) {
      acertos++;
      row.classList.add("correct");
    } else if (resp) {
      row.classList.add("wrong");
    }
  });

  const nota = ((acertos / total) * 10).toFixed(1);
  scoreText.textContent = `${acertos}/${total}`;
  resultado.innerHTML = `<b>${acertos}/${total}</b> acertos · nota <b>${nota}</b>`;

  if (acertos === total) confeteForte();
  else if (acertos >= total * 0.7) confeteLeve();
}

function confeteLeve() {
  confetti({ particleCount: 180, spread: 120, origin: { y: 0.65 } });
}

function confeteForte() {
  const end = Date.now() + 3200;
  (function frame() {
    confetti({ particleCount: 8, angle: 60, spread: 70, origin: { x: 0 } });
    confetti({ particleCount: 8, angle: 120, spread: 70, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function limpar() {
  if (!confirm("Limpar as respostas desta imagem?")) return;

  respostas = {};
  salvar();
  selecionado = null;

  document.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  const total = Object.keys(gabaritoAtual()).length;
  scoreText.textContent = "0/" + total;
  resultado.textContent = "Aguardando respostas...";
  criarLegendas();
}

function gabaritoSecreto() {
  const senha = prompt("Digite a senha do gabarito:");
  if (senha !== SENHA) {
    alert("Senha incorreta.");
    return;
  }

  const texto = Object.entries(gabaritoAtual())
    .map(([n, nome]) => `${n} — ${nome}`)
    .join("\n");

  alert(texto);
}

function aplicarZoom() {
  imagemAtual.style.transform = `scale(${zoom})`;
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => trocarJogo(btn.dataset.jogo));
});

document.getElementById("corrigirBtn").addEventListener("click", corrigir);
document.getElementById("limparBtn").addEventListener("click", limpar);
document.getElementById("gabaritoBtn").addEventListener("click", gabaritoSecreto);

document.getElementById("zoomMais").addEventListener("click", () => {
  zoom = Math.min(2.2, zoom + 0.1);
  aplicarZoom();
});

document.getElementById("zoomMenos").addEventListener("click", () => {
  zoom = Math.max(0.75, zoom - 0.1);
  aplicarZoom();
});

document.getElementById("zoomReset").addEventListener("click", () => {
  zoom = 1;
  aplicarZoom();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

trocarJogo("a");
