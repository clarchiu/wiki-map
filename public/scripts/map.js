$( function() {

  const escape = function (str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

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

  const formatPin = function(user_id, pin, form = false) {
    return form ?
    `
      <div class="pin">
      <form class="pin-submit" action="${"/maps/" + pin.map_id}${ pin.id ? "/" +  pin.id : ``}" >
      <div class="input-form">
        <span class="label">Title</span>
        <input name="title" value="${escape(pin.title || "")}" placeholder="title"/>
      </div>
      <hr/>
      <div class="text-form">
        <span class="label">Description</span>
        <textarea name="description" placeholder="description"/>${escape(pin.description || "")}</textarea>
      </div>
      <hr/>
      <div class="input-form">
        <span class="label">Image URL</span>
        <input name="imgUrl" value="${escape(pin.img_url || "")}" placeholder="image url"/>
      </div>
      <hr/>
      <div class="buttons">
        <button class="submit" type="submit">
          <span>submit</span>
          <i class="fas fa-check-square"></i>
        </button>
        ${ pin.id ? `
          <button class="delete" type="submit" formaction="${ "/maps/" + pin.map_id + "/" +  pin.id + "/delete"}">
            <span>delete</span>
            <i class="fas fa-trash-alt"></i>
          </button>
        ` : ``}
        </div>
      </form>
      </div>
    ` :
    `
      <div class="pin">
        <header class="label">${escape(pin.title)}</header>
        <div class="body">${escape(pin.description)}</div>
        <div class="preview-img">
          <img src="${escape(pin.img_url)}" placeholder="img-not-found"/>
        </div>
        ${ user_id === pin.user_id ? `
        <form name=${pin.id}>
          <div class="buttons">
            <button class="edit" type="submit">
              <span>edit</span>
              <i class="fas fa-edit"></i>
            </button>
          </div>
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

  const submitPinHandler = function(marker, pinList, mapData, index, coord = null) {
  $('form.pin-submit').on('submit', function(event) {
      const $form = $(event.target);
      const items = $.merge($form.find('input'),($form.find('textarea')));
      for (const item of items) {
        if (!$(item).val()) {
          $form.find('.err').remove();
          return $form.append(createError('fields must not be empty'));
        }
      }
      $('button.delete').off("click");
      event.preventDefault();
      event.stopPropagation();
      const sData = `${$(event.target).serialize()}${coord ? `&lat=${coord.lat}&long=${coord.long}` : ""}`;
      $.ajax({
        method: 'post',
        data: sData,
        url: `/maps/${mapData.id}${ index < 0 ? "" : `/${mapData.pins[index].id}` }`,
      })
      .then( newPin => {
        if (!pinList[newPin.id]) pinList[newPin.id] = marker;
        if ( index >= 0 ) mapData.pins[index] = newPin;
        else mapData.pins.push(newPin);
        marker.getPopup().off('remove');
        marker.setPopupContent(formatPin(newPin.user_id, newPin)).openPopup();
      })
      .catch( err => {
        $('#map').append(createError(err.statusText));
      });
    });
  };

  const addPin = function(map, pinList, mapData) {
    map.on('click', function(event) {
      const lat = event.latlng.lat;
      const long = event.latlng.lng;
      const marker = L.marker([lat, long])
        .addTo(map)
        .bindPopup(formatPin(null, {lat, long},true)).openPopup();
      marker.getPopup().on('remove', function() {
        map.removeLayer(marker);
      });

      submitPinHandler(marker, pinList, mapData, -1, { lat, long })
    });

  };

  const onDeletePin = function(map, marker, pinList, mapData, index) {
    $('button.delete').on("click", function(event) {
      if (!$(this).attr('formaction')) return;
      $('form.pin-submit').off('submit');
      event.preventDefault();
      event.stopPropagation();
      $.ajax({
        method: 'post',
        url: $(this).attr('formaction'),
      })
      .then( deletedPin => {
        delete pinList[deletedPin.id];
        mapData.pins.splice(index,1);
        map.removeLayer(marker);
      })
      .catch( err => {
        $('#map').append(createError(err.statusText));
      });
    });
  };

  const editPin = function(map, marker, pinList, mapData, index) {
    const pin = mapData.pins[index];
    marker.setPopupContent(formatPin(pin.user_id, pin, true));
    marker.getPopup().on('remove', function() {
      marker.setPopupContent(formatPin(pin.user_id, pin));
      marker.getPopup().off('remove');
    });
    onDeletePin(map, marker, pinList, mapData, index);
    submitPinHandler(marker, pinList, mapData, index);
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
        $button.removeClass('adding').text('add a pin');
      } else {
        addPin(map, pinList, data);
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
