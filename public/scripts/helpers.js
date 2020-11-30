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

const formatMapData = function(mapData, userFav) {
  const $map = $(`
  <tr>
    <td>${mapData.creator_name}</td>
    <td><a href="/maps/${mapData.id}">${mapData.name}</a></td>
    <td>${mapData.latitude}, ${mapData.longitude}</td>
    <td>${mapData.created_at}</td>
    <td>${mapData.views}</td>
    <td><form class="${userFav[mapData.id] ? "favorited" : "unfavorited"}" action="/users/${mapData.id}/favorite">
          <button><i class="fas fa-heart"></i></button>
    </form></td>
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
