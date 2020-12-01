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
    </div>
    `;
    return map;
  };

  const formatPin = function(map, pin, form = false) {
    return L.marker([pin.lat, pin.long]).addTo(map).bindPopup(form ?
    `
      <div class="pin">
      <form class="pin-submit" action="${window.location.pathname}${ pin.id ? "/" +  pin.id : ``}" >
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
      <form class="pin-delete" action="${window.location.pathname + "/" +  pin.id + "/delete"}">
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
        <form action="${window.location.pathname + "/" +  pin.id}" >
          <button>
            <span>edit</span>
            <i class="fas fa-edit"></i>
          </button>
        </form>
      </div>
    `);
  };

  const bindPins = function(map, pins) {
    for (const pin of pins) {
      formatPin(map, pin);
    }
  };

  const addPin = function(event) {
    const map = this;
    const lat = event.latlng.lat;
    const long = event.latlng.lng;
    const marker = formatPin(map, {lat, long},true).openPopup();
    const form = marker.getPopup();

    form.on('remove', function() {
      map.removeLayer(marker);
    });

    $('form.pin-submit').on('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      let data = $(event.target).serialize();
      data = `${data}&lat=${lat}&long=${long}`;
      $.ajax({
        method: 'post',
        data: data,
        url: window.location.pathname,
      })
      .then( pin => {
        form.off('remove');
        map.removeLayer(marker);
        formatPin(map, pin).openPopup();
      })
      .catch( err => {
        $('#map').append(createError(err.message));
      });
    });
  }

  const editPin = function(marker) {
    marker.setPopupContent(`test`);
  }

  const deletePin = function(map, marker) {
    map.removeLayer(marker);
  };

  const addPinnedMap = function(data) {
    const map = L.map('mapid',{
      minZoom: 10,
    }).setView([data.lat,data.long],10);

    const bounds = map.getBounds().pad(0.1);
    map.setMaxBounds([bounds.getSouthWest(),bounds.getNorthEast()]);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiYmVuamFtaW5qc2xlZSIsImEiOiJja2kzdnMwbDIwdTh1MnJsbDEydXRmbmlnIn0.a9_MKoOCA9hD9eWAirPiJw'
    }).addTo(map);

    bindPins(map,data.pins);

    map.on('click', addPin);
    // map.off('click', addPin);
    return map;
  };

  const renderPinnedMap = function($target, promise) {
    return promise.then((data) => {
      let $map = formatBorder(data);
      $target.append($map);
      addPinnedMap(data);
    })
  };

  const loadPinnedMap = function($target, url) {
    renderPinnedMap($target, $.ajax({
      method: 'get',
      url: url,
    }))
      .catch(err => {
        $target.append(createError(err.message));
      });
  };

  loadPinnedMap($('#map'),window.location.pathname + "/json");

});
