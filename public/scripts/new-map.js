const updateFormLatLng = function($lat, $long, mapState) {
  const { lat, lng } = mapState;
  $lat.text('Lat: ' + lat);
  $long.text('Long: ' + lng);
}

// http://stackoverflow.com/questions/5524045/jquery-non-ajax-post
/**
 * Since need to redirect after post request but also do JS manipulation,
 * this function performs normal post request instead of ajax
 * @param {string} action path
 * @param {string} method request method
 * @param {{name: string, value: *}} values form input
 */
function submit(action, method, values) {
  const form = $('<form/>', {
    action: action,
    method: method
  });
  $.each(values, function() {
    form.append($('<input/>', {
      type: 'hidden',
      name: this.name,
      value: this.value
    }));
  });
  form.appendTo('body').submit(); //need to append to body to submit
}

$(function() {
  const $lat = $("#coordinates .lat");
  const $long = $("#coordinates .long");
  const $name = $("#new-map-form input[name='name']");
  const $searchBox = $('#search-box');

  const mapView = createMapPreview();
  const autocomplete = initAutocomplete(getMapBounds(mapView));
  const geocoder = new google.maps.Geocoder();

  //centerMapOnUserLocation(mapView);
  updateFormLatLng($lat, $long, getMapState(mapView));

  autocomplete.addListener("place_changed", function() {
    const place = autocomplete.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    updateMapCenter(mapView, lat, lng);
  });

  mapView.on('movestart', function() {
    showErrMsg(false, 0);
  });

  mapView.on('move', _.throttle(function() {
    updateFormLatLng($lat, $long, getMapState(mapView));
  }, 100));

  mapView.on('move', _.debounce(function() {
    // reverse geocode here
    const mapState = getMapState(mapView);
    console.log(mapState.zoom);
    reverseGeocode(geocoder, mapState, (address) => {
      if (address) {
        $searchBox.val(address);
        return;
      }
      $searchBox.val('');
    });
  }, 500));

  // TODO: add client side input verification
  $('form').on('submit', function(event) {
    event.preventDefault();

    if (!$name.val()) {
      showErrMsg(true, 1, 'Name cannot be empty!');
      return;
    }
    const PATH = '/maps';
    const mapState = getMapState(mapView);
    updateFormLatLng($lat, $long, mapState);

    submit(PATH, 'POST', [
      { name: 'name', value: $name.val() },
      { name: 'lat', value: mapState.lat },
      { name: 'long', value: mapState.lng },
      { name: 'zoom', value: mapState.zoom }
    ]);
  });

  $('#err').on('click', function(event) {
    showErrMsg(false, 1);
  })
});
