// MAPA
const map = L.map("map").setView([-15.78, -47.93], 5);

const mapa = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
const satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
);
const ruas = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { opacity: 0.5 }
);

mapa.addTo(map);

let usandoSatelite = false;

// ESTADO
let gravando = false;
let rotaAtual = null;
let rotas = JSON.parse(localStorage.getItem("rotas")) || [];
let linha = L.polyline([], { color: "#6a1b9a" }).addTo(map);

// ELEMENTOS
const btnMain = document.getElementById("btnMain");
const btnAddStop = document.getElementById("btnAddStop");
const btnSatellite = document.getElementById("btnSatellite");
const btnRoutes = document.getElementById("btnRoutes");
const routesTab = document.getElementById("routesTab");
const routesList = document.getElementById("routesList");
const search = document.getElementById("search");

// FUNÇÕES
function salvarRotas() {
  localStorage.setItem("rotas", JSON.stringify(rotas));
}

function renderRotas(filtro = "") {
  routesList.innerHTML = "";
  rotas
    .filter(r => r.nome.toLowerCase().includes(filtro.toLowerCase()))
    .forEach((r, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${r.nome}</span>
        <button onclick="excluirRota(${i})">🗑</button>
      `;
      routesList.appendChild(li);
    });
}

window.excluirRota = i => {
  if (confirm("Excluir rota?")) {
    rotas.splice(i, 1);
    salvarRotas();
    renderRotas(search.value);
  }
};

// BOTÃO PRINCIPAL
btnMain.onclick = () => {
  gravando = !gravando;

  if (gravando) {
    rotaAtual = { nome: `Rota ${rotas.length + 1}`, pontos: [] };
    linha.setLatLngs([]);
    btnMain.textContent = "⏹ Encerrar rota";
    btnAddStop.disabled = false;
  } else {
    rotas.push(rotaAtual);
    salvarRotas();
    btnMain.textContent = "▶ Iniciar rota";
    btnAddStop.disabled = true;
  }
};

// ADICIONAR PARADA
btnAddStop.onclick = () => {
  map.once("click", e => {
    linha.addLatLng(e.latlng);
    rotaAtual.pontos.push({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      hora: new Date().toLocaleTimeString()
    });
  });
};

// SATÉLITE
btnSatellite.onclick = () => {
  if (usandoSatelite) {
    map.removeLayer(satelite);
    map.removeLayer(ruas);
    mapa.addTo(map);
  } else {
    map.removeLayer(mapa);
    satelite.addTo(map);
    ruas.addTo(map);
  }
  usandoSatelite = !usandoSatelite;
};

// ROTAS
btnRoutes.onclick = () => {
  routesTab.classList.toggle("hidden");
  renderRotas();
};

search.oninput = e => renderRotas(e.target.value);
