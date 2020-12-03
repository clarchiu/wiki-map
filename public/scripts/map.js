$( function() {

  const formatBorder = function(data) {
    let map = `
    <div class="pinned-map">
    <header>
      <span>${escape(data.name)}</span>
      <div>
        <span class="date">${data.created_at.slice(0,10)}</span>
        <span class="views"><i class="fas fa-eye" aria-hidden="true"></i>${data.views}</span>
      </div>
    </header>
    <div id="mapid"></div>
    <footer>
      <div class="buttons">
        ${ data.isAuth ? `<button class="add-pin">add pin</button>` : ``}
        <button class="reset-view">reset view</button>
      </div>
    </footer>
    </div>
    `;
    return map;
  };

  const addMap = function(data) {
    const map = L.map('mapid',{
      minZoom: 1,
      tap: false,
    }).setView([data.lat,data.long],data.zoom);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiYmVuamFtaW5qc2xlZSIsImEiOiJja2kzdnMwbDIwdTh1MnJsbDEydXRmbmlnIn0.a9_MKoOCA9hD9eWAirPiJw'
    }).addTo(map);

    return map;
  };

  const addMapEventListeners = function(map, pinList, data) {

    $('.add-pin').on('click', function(event) {
      event.preventDefault();
      const $button = $(event.target);
      if ($button.hasClass('adding')) {
        map.off('click');
        $('#mapid').removeClass('pinpoint');
        $button.removeClass('adding').text('add a pin');
      } else {
        addPin(map, pinList, data);
        $('#mapid').addClass('pinpoint');
        $button.addClass('adding').text('stop adding');
      }
    });

    $('#mapid').on('submit', function(event) {
      event.preventDefault();
      const $form = $(event.target);
      const pin_id = Number($form.attr('name'));
      if (!pin_id) return;
      let i;
      for (i = 0; i < data.pins.length; i++) {
        if (data.pins[i].id === pin_id) break;
      }
      const marker = pinList[pin_id];
      editPin(map, marker, pinList, data, i);
    });

    $('.reset-view').on('click', function() {
      map.flyTo([data.lat,data.long],data.zoom);
    });
  };

  const renderPinnedMap = function($target, promise) {
    return promise.then((data) => {
      let $border = formatBorder(data);
      $target.append($border);
      const map = addMap(data);
      const pinList = bindPins(map,data);
      addMapEventListeners(map, pinList, data);
    })
  };

  const loadPinnedMap = function($target, url) {
    renderPinnedMap($target, $.ajax({
      method: 'get',
      url: url,
    })
    .then(data => {
      return $.ajax({
        method: 'get',
        url: '/users/me/json',
      })
      .then(userData => {
        return { ...userData, ...data };
      });
    }))
      .catch(err => {
        $target.append(createError(err.message));
      });
  };

  loadPinnedMap($('#map'),window.location.pathname + "/json");

});
