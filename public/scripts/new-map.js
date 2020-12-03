const updateFormLatLng = function($lat, $long, mapState) {
  const { lat, lng } = mapState;
  $lat.val(lat);
  $long.val(lng);
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
  const DEFAULT = [49.2600, -123.1207];
  const MAP_ID = 'mapid';
  const $lat = $("input[name='lat']");
  const $long = $("input[name='long']");

  const mapView = createMapPreview(MAP_ID, DEFAULT);
  updateFormLatLng($lat, $long, getMapState(mapView));

  mapView.on('movestart', function() {
    showErrMsg(false, 200);
    updateFormLatLng($lat, $long, getMapState(mapView));
  });

  mapView.on('moveend', function() {
    updateFormLatLng($lat, $long, getMapState(mapView));
  });

  $("input.coord").on('input', _.debounce(function() {
    const $this = $(this);
    const input = $this.val();

    if (!$.isNumeric(input)) {
      showErrMsg(true, 1, $(`label[for=${$this.attr('name')}]`).text() + ' must be a number!');
      return;
    }
    showErrMsg(false, 200);
    updateMapCenter(mapView, input);
  }, 500));

  // TODO: add client side input verification
  $('form').on('submit', function(event) {
    event.preventDefault();
    const $name = $("input[name='name']");

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
});
