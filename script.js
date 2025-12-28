document.addEventListener("DOMContentLoaded", () => {

  // ===== NAVEGAÇÃO =====
  window.showView = function (id) {
    document.querySelectorAll(".view").forEach(v =>
      v.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");

    if (id === "view-routes") carregarLista();
  };

  // ===== MAPA =====
  const map = L.map("map").setView([-15.78, -47.93], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  let rotaAtual = { nome: "", paradas: [] };
  let rotasSalvas = JSON.parse(localStorage.getItem("rotas")) || [];
  let marcadores = [];
  let linha = L.polyline([]).addTo(map);

  function atualizarLinha() {
    linha.setLatLngs(rotaAtual.paradas.map(p => [p.lat, p.lng]));
  }

  map.on("click", e => {
    const nome = prompt("Nome da parada:");
    if (!nome) return;

    const marker = L.marker(e.latlng).addTo(map);
    marcadores.push(marker);

    rotaAtual.paradas.push({
      nome,
      lat: e.latlng.lat,
      lng: e.latlng.lng
    });

    atualizarLinha();
  });

  // ===== BOTÕES =====
  document.getElementById("save").onclick = () => {
    rotaAtual.nome =
      document.getElementById("routeName").value || "Sem nome";

    rotasSalvas.push(JSON.parse(JSON.stringify(rotaAtual)));
    localStorage.setItem("rotas", JSON.stringify(rotasSalvas));

    alert("Rota salva");
  };

  document.getElementById("new").onclick = () => {
    rotaAtual = { nome: "", paradas: [] };
    marcadores.forEach(m => map.removeLayer(m));
    marcadores = [];
    linha.setLatLngs([]);
    document.getElementById("routeName").value = "";
  };

  // ===== LISTA + BUSCA =====
  function carregarLista() {
    const ul = document.getElementById("routesList");
    const termo = document.getElementById("search").value.toLowerCase();
    ul.innerHTML = "";

    rotasSalvas
      .filter(r => r.nome.toLowerCase().includes(termo))
      .forEach((rota, i) => {
        const li = document.createElement("li");
        li.textContent = rota.nome;
        li.onclick = () => abrirDetalhes(i);
        ul.appendChild(li);
      });
  }

  document.getElementById("search").oninput = carregarLista;

  // ===== DETALHES =====
  window.abrirDetalhes = function (i) {
    const rota = rotasSalvas[i];
    document.getElementById("detailTitle").textContent = rota.nome;

    const ul = document.getElementById("detailStops");
    ul.innerHTML = "";

    rota.paradas.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.nome;
      ul.appendChild(li);
    });

    showView("view-details");
  };

});
