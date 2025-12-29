const map = L.map("map").setView([-15.78, -47.93], 5);

const normal = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { maxZoom: 19 }
).addTo(map);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19 }
);

const labels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
  { maxZoom: 19 }
);

let satOn = false;

// SATÉLITE
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

// LOCALIZAÇÃO
document.getElementById("btnLocate").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
  });
};

document.getElementById("btnDefine").onclick = () =>
  alert("Clique no mapa para definir sua localização");

// GARANTIA
setTimeout(() => map.invalidateSize(), 300);
