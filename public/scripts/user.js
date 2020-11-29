$( function() {

  const formatMapData = function(mapData) {
    const $map = $(`
    <tr>
      <td>${mapData.creator_name}</td>
      <td><a href="/maps/${mapData.id}">${mapData.name}</a></td>
      <td>${mapData.latitude}, ${mapData.longitude}</td>
      <td>${mapData.created_at}</td>
      <td>${mapData.views}</td>
      <td><i class="fas fa-heart"></i></td>
    </tr>
    `);
    return $map;
  }

  const renderRequest = function($target, promise) {
    return promise.then(maps => {
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
        $target.append(err.message);
      });
  }

  loadMapData($('#favorites'), window.location.pathname + '/favorites');
  loadMapData($('#contributions'), window.location.pathname + '/contributions');
});
