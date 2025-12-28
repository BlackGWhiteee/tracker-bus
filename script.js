document.addEventListener("DOMContentLoaded", () => {

  window.showView = id => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if (id === "view-routes") carregarLista();
  };

  const map = L.map("map").setView([-15.78, -47.93], 5);

  const mapaBase = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  );
  const ruas = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { opacity: 0.5 }
  );

  mapaBase.addTo(map);

  let usandoSatelite = false;

  // ===== ESTADO =====
  let gravando = false;
  let watchId = null;
  let rotaAtual = null;
  let linha = L.polyline([], { color: "#6a1b9a" }).addTo(map);
  let marcadores = [];

  let rotas = JSON.parse(localStorage.getItem("rotas")) || [];

  // ===== BOTÕES =====
  const startBtn = document.getElementById("start");
  const stopBtn = document.getElementById("addStop");
  const finishBtn = document.getElementById("finish");
  const locateBtn = document.getElementById("locate");
  const manualBtn = document.getElementById("manual");
  const toggleBtn = document.getElementById("toggleLayer");

  function horaAtual() {
    return new Date().toLocaleTimeString();
  }

  // INICIAR ROTA
  startBtn.onclick = () => {
    const nome = document.getElementById("routeName").value;
    if (!nome) return alert("Informe o nome da rota");

    rotaAtual = {
      nome,
      inicio: horaAtual(),
      trajeto: [],
      paradas: []
    };

    gravando = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    finishBtn.disabled = false;

    watchId = navigator.geolocation.watchPosition(pos => {
      const { latitude, longitude } = pos.coords;
      rotaAtual.trajeto.push({ lat: latitude, lng: longitude, hora: horaAtual() });
      linha.addLatLng([latitude, longitude]);
      map.setView([latitude, longitude], 16);
    });
  };

  // ADICIONAR PARADA
  stopBtn.onclick = () => {
    if (!gravando) return;
    const nome = prompt("Nome da parada:");
    if (!nome) return;

    const p = rotaAtual.trajeto.at(-1);
    const m = L.marker([p.lat, p.lng])
      .addTo(map)
      .bindPopup(`${nome}<br>${horaAtual()}`);

    marcadores.push(m);
    rotaAtual.paradas.push({ nome, ...p, hora: horaAtual() });
  };

  // ENCERRAR
  finishBtn.onclick = () => {
    navigator.geolocation.clearWatch(watchId);
    rotaAtual.fim = horaAtual();

    rotas.push(rotaAtual);
    localStorage.setItem("rotas", JSON.stringify(rotas));

    alert("Rota salva");

    gravando = false;
    rotaAtual = null;
    linha.setLatLngs([]);
    marcadores.forEach(m => map.removeLayer(m));
    marcadores = [];

    startBtn.disabled = false;
    stopBtn.disabled = true;
    finishBtn.disabled = true;
    document.getElementById("routeName").value = "";
  };

  // MINHA POSIÇÃO
  locateBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 16);
    });
  };

  // DEFINIR MANUAL
  manualBtn.onclick = () => {
    alert("Clique no mapa para definir sua localização");
    map.once("click", e => map.setView(e.latlng, 16));
  };

  // SATÉLITE / MAPA
  toggleBtn.onclick = () => {
    if (usandoSatelite) {
      map.removeLayer(satelite);
      map.removeLayer(ruas);
      mapaBase.addTo(map);
    } else {
      map.removeLayer(mapaBase);
      satelite.addTo(map);
      ruas.addTo(map);
    }
    usandoSatelite = !usandoSatelite;
  };

  // LISTA
  function carregarLista() {
    const ul = document.getElementById("routesList");
    const termo = document.getElementById("search").value.toLowerCase();
    ul.innerHTML = "";

    rotas.filter(r => r.nome.toLowerCase().includes(termo)).forEach((r, i) => {
      const li = document.createElement("li");
      li.textContent = r.nome;
      li.onclick = () => abrirRota(i);
      ul.appendChild(li);
    });
  }

  document.getElementById("search").oninput = carregarLista;

  // ABRIR ROTA
  function abrirRota(i) {
    showView("view-map");
    linha.setLatLngs([]);
    marcadores.forEach(m => map.removeLayer(m));
    marcadores = [];

    const r = rotas[i];
    r.trajeto.forEach(p => linha.addLatLng([p.lat, p.lng]));

    r.paradas.forEach(p => {
      const m = L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`${p.nome}<br>${p.hora}`);
      marcadores.push(m);
    });

    map.fitBounds(linha.getBounds());
  }

});
