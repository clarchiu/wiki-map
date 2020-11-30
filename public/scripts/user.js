$( function() {

  const formatMapData = function(mapData) {
    const $map = $(`
    <tr>
      <td>${mapData.creator_name}</td>
      <td><a href="/maps/${mapData.id}">${mapData.name}</a></td>
      <td>${mapData.lat}, ${mapData.long}</td>
      <td>${mapData.created_at}</td>
      <td>${mapData.views}</td>
      <td><form class="${mapData.favorited ? "favorited" : "unfavorited"}" action="/users/${mapData.id}/favorite">
            <button><i class="fas fa-heart"></i></button>
      </form></td>
    </tr>
    `);
    return $map;
  }

  const renderRequest = function($target, promise) {
    return promise.then(maps => {
      if ( !maps[0] ) return $target.append('<span>Nothing to see here...</span>');
      for (const map of maps) {
        let $map = formatMapData(map);
        $target.append($map);
      }
    });
  }

  const loadMapData = function($target, url) {
    renderRequest($target, $.ajax({
        method: 'get',
        url: url,
      }))
      .catch(err => {
        $target.append(createError(err.message));
      });
  }

  loadMapData($('#favorites'), window.location.pathname + '/favorites');
  loadMapData($('#contributions'), window.location.pathname + '/contributions');
});
