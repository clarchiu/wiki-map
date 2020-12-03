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
      $('form.pin-submit').off('submit');
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
        submitPinHandler(marker, pinList, mapData, index, coord);
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

const onDeletePin = function(map, marker, pinList, mapData, index) {
  $('button.delete').on("click", function(event) {
    if (!$(this).attr('formaction')) return;
    $('form.pin-submit').off('submit');
    $('button.delete').off('click');
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
      onDeletePin(map, marker, pinList, mapData, index);
      $('#map').append(createError(err.statusText));
    });
  });
};
