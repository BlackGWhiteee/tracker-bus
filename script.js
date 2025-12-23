// Inicialização do mapa
const map = L.map("map").setView([-15.78, -47.93], 5);

// Camadas
const mapaPadrao = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
);

const mapaSatelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri" }
);

mapaPadrao.addTo(map);

L.control.layers(
  { "Mapa": mapaPadrao, "Satélite": mapaSatelite }
).addTo(map);

// Estado
let modo = null;
let rotaAtual = { nome: "", paradas: [] };
let marcadores = [];
let linha = L.polyline([], { color: "blue" }).addTo(map);

// Funções
function atualizarLinha() {
  linha.setLatLngs(rotaAtual.paradas.map(p => [p.lat, p.lng]));
}

// Botões
document.getElementById("add").onclick = function () {
  modo = "add";
  alert("Clique no mapa para adicionar a parada");
};

document.getElementById("remove").onclick = function () {
  modo = "remove";
  alert("Clique na parada para remover");
};

document.getElementById("manual").onclick = function () {
  modo = "manual";
  alert("Clique no mapa para definir sua localização");
};

document.getElementById("gps").onclick = function () {
  navigator.geolocation.getCurrentPosition(function (pos) {
    const latlng = [pos.coords.latitude, pos.coords.longitude];
    L.marker(latlng)
      .addTo(map)
      .bindPopup("Você está aqui")
      .openPopup();
    map.setView(latlng, 15);
  });
};

document.getElementById("save").onclick = function () {
  rotaAtual.nome =
    document.getElementById("routeName").value || "rota_sem_nome";

  const data = JSON.stringify(rotaAtual, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = rotaAtual.nome + ".json";
  a.click();
};

document.getElementById("new").onclick = function () {
  rotaAtual = { nome: "", paradas: [] };
  marcadores.forEach(m => map.removeLayer(m));
  marcadores = [];
  linha.setLatLngs([]);
  document.getElementById("routeName").value = "";
};

// Clique no mapa
map.on("click", function (e) {
  if (modo === "add") {
    const nome = prompt("Nome da parada:");
    const horario = prompt("Horário (opcional):");

    const marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup("<b>" + nome + "</b><br>" + (horario || ""));

    marker.on("click", function () {
      if (modo === "remove") {
        const i = marcadores.indexOf(marker);
        if (i > -1) {
          map.removeLayer(marker);
          marcadores.splice(i, 1);
          rotaAtual.paradas.splice(i, 1);
          atualizarLinha();
        }
      }
    });

    marcadores.push(marker);
    rotaAtual.paradas.push({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      nome: nome,
      horario: horario
    });

    atualizarLinha();
    modo = null;
  }

  if (modo === "manual") {
    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("Localização definida")
      .openPopup();
    map.setView(e.latlng, 15);
    modo = null;
  }
});
