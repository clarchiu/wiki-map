const updateFormLatLng = function(mapState) {
  const { lat, lng } = mapState;
  $("input[name='lat']").attr('placeholder', lat);
  $("input[name='long']").attr('placeholder', lng);
}

$(function() {
  const DEFAULT = [49.2600, -123.1207];
  const map = createMapPreview(DEFAULT);
  updateFormLatLng(getMapViewState(map));

  map.on('moveend', function() {
    updateFormLatLng(getMapViewState(map));
  });

  $("input[name='lat']").on('input', _.debounce(function() {
    console.log($(this).val());
    updateMapCenter(map, $(this).val());
  }, 500));

  $("input[name='long']").on('input', _.debounce(function() {
    console.log($(this).val());
    updateMapCenter(map, $(this).val());
  }, 500));

  // TODO: add client side input verification
});
