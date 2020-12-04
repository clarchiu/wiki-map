const createMapPreview = function() {
  const DEFAULT = [49.2600, -123.1207];
  const MAP_ID = 'mapid';

  const mymap = L.map(MAP_ID).setView(DEFAULT, 13);
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
    lat: round(center.lat, 4),
    lng: round(center.lng, 4),
  };
}

const getMapBounds = function(mapView) {
  const bounds = mapView.getBounds();
  return {
    northEast: bounds.getNorthEast(),
    southWest: bounds.getSouthWest(),
  }
}

const updateMapCenter = function (map, lat, lng) {
  const mapState = getMapState(map);
  const newLat = lat || mapState.lat;
  const newLng = lng || mapState.lng;
  map.panTo([newLat, newLng]);
}

const centerMapOnUserLocation = function(map) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      updateMapCenter(map, latitude, longitude);
    },
    () => updateMapCenter(map));
}

const parseGeocodeResponse = function (res, zoom) {
  for (const address of res) {
    console.log(address);
    const types = address.types;
    if (types.includes('locality') || types.includes('neighborhood')) {
      return address.formatted_address;
    }
  }
}

const reverseGeocode = function(geocoder, mapState, complete) {
  const { lat, lng } = mapState;
  geocoder.geocode({location: { lat, lng }}, (res, status) => {
    if (status !== 'OK' || res.length === 0) {
      return '';
    }
    const address = parseGeocodeResponse(res, mapState.zoom);
    complete(address);
  });
}

