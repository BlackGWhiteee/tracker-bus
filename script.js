// ======== NAVEGAÇÃO ========
function showView(id) {
  document.querySelectorAll(".view").forEach(v =>
    v.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");

  if (id === "view-routes") carregarLista();
}

// ======== MAPA ========
var map = L.map("map").setView([-15.78, -47.93], 5);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
).addTo(map);

// ======== ROTAS ========
var rotaAtual = { nome: "", paradas: [] };
var rotasSalvas = JSON.parse(localStorage.getItem("rotas")) || [];
var marcadores = [];
var linha = L.polyline([]).addTo(map);

function atualizarLinha() {
  linha.setLatLngs(rotaAtual.paradas.map(p => [p.lat, p.lng]));
}

// Clique no mapa
map.on("click", function (e) {
  var nome = prompt("Nome da parada:");
  if (!nome) return;

  var m = L.marker(e.latlng).addTo(map);
  marcadores.push(m);

  rotaAtual.paradas.push({
    nome,
    lat: e.latlng.lat,
    lng: e.latlng.lng
  });

  atualizarLinha();
});

// ======== SALVAR ========
document.getElementById("save").onclick = function () {
  rotaAtual.nome =
    document.getElementById("routeName").value || "Sem nome";

  rotasSalvas.push(JSON.parse(JSON.stringify(rotaAtual)));
  localStorage.setItem("rotas", JSON.stringify(rotasSalvas));

  alert("Rota salva");
};

// ======== LISTA + BUSCA ========
function carregarLista() {
  var ul = document.getElementById("routesList");
  var termo = document.getElementById("search").value.toLowerCase();

  ul.innerHTML = "";

  rotasSalvas
    .filter(r => r.nome.toLowerCase().includes(termo))
    .forEach((rota, i) => {
      var li = document.createElement("li");
      li.innerText = rota.nome;
      li.onclick = () => abrirDetalhes(i);
      ul.appendChild(li);
    });
}

document.getElementById("search").oninput = carregarLista;

// ======== DETALHES ========
function abrirDetalhes(i) {
  var rota = rotasSalvas[i];
  document.getElementById("detailTitle").innerText = rota.nome;

  var ul = document.getElementById("detailStops");
  ul.innerHTML = "";

  rota.paradas.forEach(p => {
    var li = document.createElement("li");
    li.innerText = p.nome;
    ul.appendChild(li);
  });

  showView("view-details");
}
