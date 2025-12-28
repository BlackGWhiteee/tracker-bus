document.addEventListener("DOMContentLoaded", function () {

  // ======== NAVEGAÇÃO ENTRE ABAS ========
  window.showView = function (id) {
    document.querySelectorAll(".view").forEach(v =>
      v.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");

    if (id === "view-routes") carregarLista();
  };

  // ======== MAPA ========
  var map = L.map("map").setView([-15.78, -47.93], 5);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  ).addTo(map);

  // ======== ESTADO ========
  var rotaAtual = { nome: "", paradas: [] };
  var rotasSalvas = JSON.parse(localStorage.getItem("rotas")) || [];
  var marcadores = [];
  var linha = L.polyline([]).addTo(map);

  function atualizarLinha() {
    linha.setLatLngs(rotaAtual.paradas.map(p => [p.lat, p.lng]));
  }

  // ======== CLIQUE NO MAPA ========
  map.on("click", function (e) {
    var nome = prompt("Nome da parada:");
    if (!nome) return;

    var marker = L.marker(e.latlng).addTo(map);
    marcadores.push(marker);

    rotaAtual.paradas.push({
      nome: nome,
      lat: e.latlng.lat,
      lng: e.latlng.lng
    });

    atualizarLinha();
  });

  // ======== BOTÕES (AGORA COM SEGURANÇA) ========
  var btnSave = document.getElementById("save");
  var btnNew = document.getElementById("new");

  if (btnSave) {
    btnSave.onclick = function () {
      rotaAtual.nome =
        document.getElementById("routeName").value || "Sem nome";

      rotasSalvas.push(JSON.parse(JSON.stringify(rotaAtual)));
      localStorage.setItem("rotas", JSON.stringify(rotasSalvas));

      alert("Rota salva com sucesso");
    };
  }

  if (btnNew) {
    btnNew.onclick = function () {
      rotaAtual = { nome: "", paradas: [] };
      marcadores.forEach(m => map.removeLayer(m));
      marcadores = [];
      linha.setLatLngs([]);
      document.getElementById("routeName").value = "";
    };
  }

  // ======== LISTA DE ROTAS + BUSCA ========
  function carregarLista() {
    var ul = document.getElementById("routesList");
    var termo = document.getElementById("search").value.toLowerCase();

    ul.innerHTML = "";

    rotasSalvas
      .filter(r => r.nome.toLowerCase().includes(termo))
      .forEach((rota, index) => {
        var li = document.createElement("li");
        li.textContent = rota.nome;
        li.onclick = function () {
          abrirDetalhes(index);
        };
        ul.appendChild(li);
      });
  }

  var searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.oninput = carregarLista;
  }

  // ======== DETALHES DA ROTA ========
  window.abrirDetalhes = function (index) {
    var rota = rotasSalvas[index];
    document.getElementById("detailTitle").textContent = rota.nome;

    var ul = document.getElementById("detailStops");
    ul.innerHTML = "";

    rota.paradas.forEach(p => {
      var li = document.createElement("li");
      li.textContent = p.nome;
      ul.appendChild(li);
    });

    showView("view-details");
  };

});
