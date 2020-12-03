const createMapPreview = function(id, latlng) {
  const mymap = L.map(id).setView(latlng, 13);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 1,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZm9ybXNob290ZXIiLCJhIjoiY2tpNDdhd3I1MjB6czMzbzJuOTlhcm14ayJ9.HpP-a7lmU22QbOqwifry1A'
  }).addTo(mymap);
  return mymap;
};

const getMapState = function(mapView) {
  const center = mapView.getCenter();
  return {
    zoom: mapView.getZoom(),
    lat: Math.round(center.lat * 10000) / 10000,
    lng: Math.round(center.lng * 10000) / 10000,
  };
}

const updateMapCenter = function (map, lat, lng) {
  const mapState = getMapState(map);
  const newLat = lat || mapState.lat;
  const newLng = lng || mapState.lng;
  map.panTo([newLat, newLng]);
}
