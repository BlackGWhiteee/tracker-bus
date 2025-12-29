const tabMap = document.getElementById("tabMap");
const tabRoutes = document.getElementById("tabRoutes");
const goMap = document.getElementById("goMap");
const goRoutes = document.getElementById("goRoutes");

/* MAPA */
const map = L.map("map").setView([-15.78, -47.93], 5);

const normal = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { maxZoom: 19 }
).addTo(map);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19 }
);

// overlay de ruas (nomes)
const labels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
  { maxZoom: 19 }
);

let satOn = false;

document.getElementById("btnToggleMap").onclick = () => {
  if (satOn) {
    map.removeLayer(satellite);
    map.removeLayer(labels);
    normal.addTo(map);
  } else {
    map.removeLayer(normal);
    satellite.addTo(map);
    labels.addTo(map);
  }
  satOn = !satOn;
};

/* LOCALIZAÇÃO AUTOMÁTICA */
document.getElementById("btnLocate").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
  });
};

/* DEFINIR LOCALIZAÇÃO MANUAL */
document.getElementById("btnDefine").onclick = () => {
  alert("Clique no mapa para definir sua localização");
};

/* TABS */
function abrir(tab) {
  tabMap.classList.remove("active");
  tabRoutes.classList.remove("active");
  goMap.classList.remove("active");
  goRoutes.classList.remove("active");

  if (tab === "map") {
    tabMap.classList.add("active");
    goMap.classList.add("active");
    setTimeout(() => map.invalidateSize(), 200);
  } else {
    tabRoutes.classList.add("active");
    goRoutes.classList.add("active");
  }
}

goMap.onclick = () => abrir("map");
goRoutes.onclick = () => abrir("routes");

/* GARANTIA FINAL */
setTimeout(() => map.invalidateSize(), 300);
