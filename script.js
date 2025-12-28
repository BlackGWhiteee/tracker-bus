document.addEventListener("DOMContentLoaded", () => {

  window.showView = id => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if (id === "view-routes") carregarLista();
  };

  const map = L.map("map").setView([-15.78, -47.93], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  let gravando = false;
  let watchId = null;
  let rotaAtual = null;
  let linha = L.polyline([], { color: "purple" }).addTo(map);
  let marcadores = [];

  let rotas = JSON.parse(localStorage.getItem("rotas")) || [];

  const startBtn = document.getElementById("start");
  const stopBtn = document.getElementById("addStop");
  const finishBtn = document.getElementById("finish");

  function horaAtual() {
    return new Date().toLocaleTimeString();
  }

  // INICIAR ROTA
  startBtn.onclick = () => {
    const nome = document.getElementById("routeName").value;
    if (!nome) return alert("Dê um nome à rota");

    rotaAtual = {
      nome,
      inicio: horaAtual(),
      trajeto: [],
      paradas: []
    };

    gravando = true;
    stopBtn.disabled = false;
    finishBtn.disabled = false;
    startBtn.disabled = true;

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

    const last = rotaAtual.trajeto.at(-1);
    const marker = L.marker([last.lat, last.lng])
      .addTo(map)
      .bindPopup(`${nome}<br>${horaAtual()}`)
      .openPopup();

    marcadores.push(marker);

    rotaAtual.paradas.push({
      nome,
      lat: last.lat,
      lng: last.lng,
      hora: horaAtual()
    });
  };

  // ENCERRAR ROTA
  finishBtn.onclick = () => {
    navigator.geolocation.clearWatch(watchId);
    rotaAtual.fim = horaAtual();

    rotas.push(rotaAtual);
    localStorage.setItem("rotas", JSON.stringify(rotas));

    alert("Rota salva");

    // reset
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

  // LISTA
  function carregarLista() {
    const ul = document.getElementById("routesList");
    const termo = document.getElementById("search").value.toLowerCase();
    ul.innerHTML = "";

    rotas
      .filter(r => r.nome.toLowerCase().includes(termo))
      .forEach((r, i) => {
        const li = document.createElement("li");
        li.textContent = r.nome;
        li.onclick = () => abrirRota(i);
        ul.appendChild(li);
      });
  }

  document.getElementById("search").oninput = carregarLista;

  // ABRIR ROTA NO MAPA
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
