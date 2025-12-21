const map = L.map('map').setView([-15.78, -47.93], 5);



document.getElementById('remove').onclick = () => {
modo = 'remove';
alert('Clique na parada para remover');
};


document.getElementById('manual').onclick = () => {
modo = 'manual';
alert('Clique no mapa para definir sua localização');
};


document.getElementById('gps').onclick = () => {
navigator.geolocation.getCurrentPosition(pos => {
const latlng = [pos.coords.latitude, pos.coords.longitude];
L.marker(latlng).addTo(map).bindPopup('Você está aqui').openPopup();
map.setView(latlng, 15);
});
};


document.getElementById('save').onclick = () => {
rotaAtual.nome = document.getElementById('routeName').value || 'rota_sem_nome';
const data = JSON.stringify(rotaAtual, null, 2);
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);


const a = document.createElement('a');
a.href = url;
a.download = rotaAtual.nome + '.json';
a.click();
};


document.getElementById('new').onclick = () => {
rotaAtual = { nome: '', paradas: [] };
marcadores.forEach(m => map.removeLayer(m));
marcadores = [];
linha.setLatLngs([]);
document.getElementById('routeName').value = '';
};


map.on('click', e => {
if (modo === 'add') {
const nome = prompt('Nome da parada:');
const horario = prompt('Horário (opcional):');


const marker = L.marker(e.latlng).addTo(map);
marker.bindPopup(`<b>${nome}</b><br>${horario || ''}`);


marker.on('click', () => {
if (modo === 'remove') {
const i = marcadores.indexOf(marker);
map.removeLayer(marker);
marcadores.splice(i, 1);
rotaAtual.paradas.splice(i, 1);
atualizarLinha();
}
});


marcadores.push(marker);
rotaAtual.paradas.push({ lat: e.latlng.lat, lng: e.latlng.lng, nome, horario });
atualizarLinha();
modo = null;
}


if (modo === 'manual') {
L.marker(e.latlng).addTo(map).bindPopup('Localização definida').openPopup();
map.setView(e.latlng, 15);
modo = null;
}
};
