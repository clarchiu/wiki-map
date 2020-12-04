const initAutocomplete = (mapBounds) => {
  const { northEast, southWest } = mapBounds;

  const defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(southWest.lat, southWest.lng),
    new google.maps.LatLng(northEast.lat, southWest.lng));

  const input = document.getElementById("search-box");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    bounds: defaultBounds,
    types: ["geocode"],
  });

  autocomplete.setFields(["address_component", "geometry"]);

  return autocomplete;
};
