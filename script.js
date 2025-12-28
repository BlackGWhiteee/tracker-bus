// MAPA
const map = L.map("map").setView([-15.78, -47.93], 5);

// CAMADAS
const mapa = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
);

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
let watchId = null;
let rotaAtual = null;
let linha = L.polyline([], { color: "#6a1b9a" }).addTo(map);
let marcadores = [];

let rotas = JSON.parse(localStorage.getItem("rotas")) || [];

// ELEMENTOS
const start = document.getElementById("start");
const addStop = document.getElementById("addStop");
const finish = document.getElementById("finish");
const locate = document.getElementById("locate");
const toggleLayer = document.getElementById("toggleLayer");

// HORA
const hora = () => new Date().toLocaleTimeString();

// INICIAR
start.onclick = () => {
  const nome = document.getElementById("routeName").value;
  if (!nome) return alert("Nome da rota obrigatório");

  rotaAtual = { nome, trajeto: [], paradas: [] };
  gravando = true;

  start.disabled = true;
  addStop.disabled = false;
  finish.disabled = false;

  watchId = navigator.geolocation.watchPosition(pos => {
    const { latitude, longitude } = pos.coords;

    rotaAtual.trajeto.push({ lat: latitude, lng: longitude, hora: hora() });
    linha.addLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 16);
  });
};

// PARADA
addStop.onclick = () => {
  if (!rotaAtual) return;

  const nome = prompt("Nome da parada:");
  if (!nome) return;

  const p = rotaAtual.trajeto.at(-1);
  rotaAtual.paradas.push({ ...p, nome });

  const m = L.marker([p.lat, p.lng])
    .addTo(map)
    .bindPopup(`${nome}<br>${hora()}`);

  marcadores.push(m);
};

// ENCERRAR
finish.onclick = () => {
  navigator.geolocation.clearWatch(watchId);

  rotas.push(rotaAtual);
  localStorage.setItem("rotas", JSON.stringify(rotas));

  alert("Rota salva");

  linha.setLatLngs([]);
  marcadores.forEach(m => map.removeLayer(m));
  marcadores = [];

  gravando = false;
  rotaAtual = null;

  start.disabled = false;
  addStop.disabled = true;
  finish.disabled = true;
};

// LOCALIZAÇÃO
locate.onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
  });
};

// SATÉLITE
toggleLayer.onclick = () => {
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
