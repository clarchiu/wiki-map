$( function() {
  loadMapData($('#favorites'), window.location.pathname + '/favorites');
  loadMapData($('#contributions'), window.location.pathname + '/contributions');
});
