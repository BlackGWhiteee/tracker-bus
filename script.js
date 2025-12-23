alert("Mapa carregado corretamente");

// MAPA
var map = L.map("map").setView([-15.78, -47.93], 5);

// BASE MAPA NORMAL
var mapa = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
);

// SATÉLITE
var satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri" }
);

// RÓTULOS (RUAS, CIDADES, BAIRROS)
var labels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap, © CARTO",
    pane: "overlayPane"
  }
);

// SATÉLITE + NOMES ATIVOS POR PADRÃO
satelite.addTo(map);
labels.addTo(map);

// CONTROLE DE CAMADAS
L.control.layers(
  {
    "Mapa": mapa,
    "Satélite": satelite
  },
  {
    "Nomes de ruas e cidades": labels
  }
).addTo(map);

// ESTADO
var modo = null;
var rotaAtual = { nome: "", paradas: [] };
var marcadores = [];
var linha = L.polyline([], { color: "blue" }).addTo(map);

// FUNÇÃO LINHA
function atualizarLinha() {
  linha.setLatLngs(
    rotaAtual.paradas.map(function (p) {
      return [p.lat, p.lng];
    })
  );
}

// BOTÕES
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
    var latlng = [pos.coords.latitude, pos.coords.longitude];
    L.marker(latlng).addTo(map).bindPopup("Você está aqui").openPopup();
    map.setView(latlng, 15);
  });
};

document.getElementById("save").onclick = function () {
  rotaAtual.nome =
    document.getElementById("routeName").value || "rota_sem_nome";

  var data = JSON.stringify(rotaAtual, null, 2);
  var blob = new Blob([data], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var a = document.createElement("a");
  a.href = url;
  a.download = rotaAtual.nome + ".json";
  a.click();
};

document.getElementById("new").onclick = function () {
  rotaAtual = { nome: "", paradas: [] };
  marcadores.forEach(function (m) {
    map.removeLayer(m);
  });
  marcadores = [];
  linha.setLatLngs([]);
  document.getElementById("routeName").value = "";
};

// CLIQUE NO MAPA
map.on("click", function (e) {
  if (modo === "add") {
    var nome = prompt("Nome da parada:");
    var horario = prompt("Horário (opcional):");

    var marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup("<b>" + nome + "</b><br>" + (horario || ""));

    marker.on("click", function () {
      if (modo === "remove") {
        var i = marcadores.indexOf(marker);
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
