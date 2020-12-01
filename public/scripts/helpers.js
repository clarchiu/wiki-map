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
const formatMapData = function(mapData, userFav) {
  const { creator_name, id, name, lat, long, created_at, views, zoom } = mapData;
  const $map = $(`
  <tr>
    <td>${creator_name}</td>
    <td><a href="/maps/${id}">${name}</a></td>
    <td>${lat}, ${long}</td>
    <td>${created_at}</td>
    <td>${views}</td>
    <td>
      <form class="${userFav[id] ? "favorited" : "unfavorited"}" action="/users/${mapData.id}/favorite">
        <button><i class="fas fa-heart"></i></button>
      </form>
    </td>
    <td>
      <a href="/maps/${id}">
      <img
      src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${long},${lat},${zoom}/300x300?access_token=pk.eyJ1IjoiZm9ybXNob290ZXIiLCJhIjoiY2tpNDdhd3I1MjB6czMzbzJuOTlhcm14ayJ9.HpP-a7lmU22QbOqwifry1A"
      alt="Preview of ${name} created by ${creator_name}.">
      </a>
      </td>
  </tr>
  `);
  return $map;
};

const renderRequest = function($target, promise) {
  return promise.then(maps => {
    if ( !maps[0] ) return $target.append('<span>Nothing to see here...</span>');
    return $.ajax({
      method: 'get',
      url: '/users/me/favorites',
    })
    .then((favs) => {
      let userFav = {};
      for (const fav of favs) {
        userFav[fav.map_id] = fav.favorited;
      }
      for (const map of maps) {
        let $map = formatMapData(map, userFav);
        $target.append($map);
      }
    });
  });
};

const loadMapData = function($target, url) {
  renderRequest($target, $.ajax({
      method: 'get',
      url: url,
    }))
    .catch(err => {
      $target.append(createError(err.message));
    });
};
