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
  console.log(mapData);
  const { creator_name, id, name, lat, long, created_at, views, zoom } = mapData;
  const $map = $(`
    <div class="map-preview">
      <h4>${name}</h4>
      <a href="/maps/${id}">
        <img
        src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${long},${lat},${zoom}/300x300?access_token=pk.eyJ1IjoiZm9ybXNob290ZXIiLCJhIjoiY2tpNDdhd3I1MjB6czMzbzJuOTlhcm14ayJ9.HpP-a7lmU22QbOqwifry1A"
        alt="Preview of a map of ${name} created by ${creator_name}.">
      </a>
      <footer>
        <span>Created by ${creator_name} on ${created_at.slice(0,10)}</span>
        <span>${lat}, ${long}</span>
        <span>${views}</span>
      </footer>
    </div>
  `);

  if (isLoggedIn) {
    $map.find('footer').append(`
      <span data-action="/users/${mapData.id}/favorite" class="${userFav[id] ? "favorited" : "unfavorited"}">
        <i class="fas fa-heart"></i>
      </span>
    `)
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

const getUserFavorites = function() {
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

const renderRequest = function($target, maps, isLoggedIn, userFav) {
  for (const mapData of maps) {
    let $map = formatMapData(mapData, isLoggedIn, userFav);
    $target.append($map);
  }
};
