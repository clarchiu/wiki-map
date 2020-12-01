$( function() {

  const escape = function (str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  const formatBorder = function(data) {
    let map = `
    <div class="pinned-map">
    <header>${escape(data.name)}</header>
    <div id="mapid" style="height: 500px"></div>
    <footer><span>${data.created_at}</span><span>${data.views}</span></footer>
    ${ data.isAuth ? `<button class="add-pin">add pin</button>` : ``}
    <button class="reset-view">reset view</button>
    </div>
    `;
    return map;
  };

  const formatPin = function(user_id, pin, form = false) {
    return form ?
    `
      <div class="pin">
      <form class="pin-submit" action="${"/maps/" + pin.map_id}${ pin.id ? "/" +  pin.id : ``}" >
      <header>
        <input name="title" value="${escape(pin.title || "")}" placeholder="title"/>
      </header>
      <div>
        <input name="description" value="${escape(pin.description || "")}" placeholder="description"/>
      </div>
      <div>
        <input name="imgUrl" value="${escape(pin.img_url || "")}" placeholder="image url"/>
      </div>
      <button type="submit">
        <span>submit</span>
        <i class="fas fa-check-square"></i>
      </button>
      </form>
      ${ pin.id ? `
      <form class="pin-delete" action="${ "/maps/" + pin.map_id + "/" +  pin.id + "/delete"}">
        <button type="submit">
          <span>delete</span>
          <i class="fas fa-trash-alt"></i>
        </button>
      </form>` : ``
      }
      </div>
    ` :
    `
      <div class="pin">
        <header>${escape(pin.title)}</header>
        <div>${escape(pin.description)}</div>
        <img src="${escape(pin.img_url)}" placeholder="img-not-found"/>
        ${ user_id === pin.user_id ? `
        <form name=${pin.id}>
          <button type="submit">
            <span>edit</span>
            <i class="fas fa-edit"></i>
          </button>
        </form>
        ` : `` }
      </div>
    `;
  };

  const bindPins = function(map, data) {
    const pinList = {};
    for (const pin of data.pins) {
      pinList[pin.id] = L.marker([pin.lat, pin.long])
        .addTo(map)
        .bindPopup(formatPin(data.user_id, pin));
    }
    return pinList;
  };

  const submitPinHandler = function(marker, pinList, latlng, map_id) {
    $('form.pin-submit').on('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      let data = $(event.target).serialize();
      data = `${data}&lat=${latlng.lat}&long=${latlng.lng}`;
      $.ajax({
        method: 'post',
        data: data,
        url: `/maps/${map_id}`,
      })
      .then( pin => {
        if (!pinList[pin.id]) pinList[pin.id] = marker;
        marker.getPopup().off('remove');
        marker.setPopupContent(formatPin(pin.user_id, pin)).openPopup();
      })
      .catch( err => {
        $('#map').append(createError(err.message));
      });
    });
  };

  const addPin = function(map, pinList, map_id) {
    map.on('click', function(event) {
      const marker = L.marker([event.latlng.lat, event.latlng.lng])
      .addTo(map)
      .bindPopup(formatPin(null, {lat: event.latlng.lat, long: event.latlng.lng},true)).openPopup();
      marker.getPopup().on('remove', function() {
        map.removeLayer(marker);
      });

      submitPinHandler(marker, pinList, event.latlng, map_id)
    });

  };

  const editPin = function(map, marker, pinList, pin) {
    marker.setPopupContent(formatPin(pin.user_id, pin, true));
    marker.getPopup().on('remove', function() {
      marker.setPopupContent(formatPin(pin.user_id, pin));
      marker.getPopup().off('remove');
    });
    //submitPinHandler(marker, pinList, pin.map_id);
  };

  const deletePin = function(map, marker) {
    map.removeLayer(marker);
  };

  const addMap = function(data) {
    const map = L.map('mapid',{
      minZoom: 1,
    }).setView([data.lat,data.long],data.zoom);

    // const bounds = map.getBounds().pad(0.1);
    // map.setMaxBounds([bounds.getSouthWest(),bounds.getNorthEast()]);

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
        $button.removeClass('adding').text('add a pin');
      } else {
        addPin(map, pinList, data.id);
        $button.addClass('adding').text('stop adding');
      }
    });

    $('#mapid').on('submit', function(event) {
      event.preventDefault();
      const $form = $(event.target);
      const pin_id = Number($form.attr('name'));
      if (!pin_id) return;
      const marker = pinList[pin_id];
      const pin = data.pins.filter(pin => pin.id === pin_id)[0];
      editPin(map, marker, pinList, pin);
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
