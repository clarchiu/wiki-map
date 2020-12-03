/** creates an error message element. Does not check for XXS as
 * this function is a helper function for devs and will only ever display on
 * a local client's page.
 *
 * @param {*} msg a string used as the error message
 */
const createError = function(msg) {
  const $err = $(`
    <div class="err">
      <span><i class="fas fa-exclamation-circle"></i></span>
      <span>${msg}</span>
    </div>
  `);
  $err.on('click', () => {
    $err.slideUp(500,function() {
      $err.remove();
    });
  });
  return $err;
};

// TODO: need to escape mapData
const formatMapData = function(mapData, isLoggedIn, userFav) {
  const { creator_name, creator_id, id, name, lat, long, created_at, views, zoom } = mapData;
  const $map = $(`
    <div class="map-preview">
      <h4>${name}</h4>
      <div class="preview-wrapper">
        <a href="/maps/${id}">
          <img
          src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${long},${lat},${zoom}/660x440?access_token=pk.eyJ1IjoiZm9ybXNob290ZXIiLCJhIjoiY2tpNDdhd3I1MjB6czMzbzJuOTlhcm14ayJ9.HpP-a7lmU22QbOqwifry1A"
          alt="Preview of a map of ${name} created by ${creator_name}.">
        </a>
        <header>
          <span>Created by <a href="/users/${creator_id}">${creator_name}</a> on ${created_at.slice(0,10)}</span>
          <span>${round(lat, 4)}, ${round(long, 4)}</span>
          <span><i class="fas fa-eye"></i> ${views}</span>
        </header>
      </div>
    </div>
  `);

  if (isLoggedIn) {
    $map.find('.preview-wrapper').append(`
      <span data-action="/users/${mapData.id}/favorite" class="${userFav[id] ? "favorited" : "unfavorited"}">
        <i class="fas fa-heart"></i>
      </span>
    `);
  }
  return $map;
};

const checkUserLoggedIn = function() {
  const PATH = '/users/me/json';
  return $.ajax({
    method: 'get',
    url: PATH,
  })
  .then((data) => data.user_id !== undefined)
  .catch(() => Promise.resolve(false));
};

const getMyFavoriteMaps = function() {
  return $.ajax({
    method: 'get',
    url: '/users/me/favorites',
  })
  .then(favs => {
    let userFav = {};
    for (const fav of favs) {
      userFav[fav.map_id] = fav.favorited;
    }
    return userFav;
  })
  .catch(() => Promise.resolve({}));
};

const loadMapsData = function(url) {
  return $.ajax({
    method: 'get',
    url: url
  });
};

const renderMaps = function($target, maps, isLoggedIn, myFavs) {
  if (!maps[0]) {
    return $target.append('<span>Nothing to see here...</span>');
  }
  for (const mapData of maps) {
    let $map = formatMapData(mapData, isLoggedIn, myFavs);
    $target.append($map);
  }
};
