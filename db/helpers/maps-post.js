const createNewMap = (db, mapData) => {
  const { ownerId, name, lat, long, zoom } = mapData;
  return db.query(`
  INSERT INTO maps (owner_id, name, lat, long, zoom) VALUES
  ($1, $2, $3, $4, $5)
  RETURNING *
  `, [ownerId || 1, name, lat || 49.26, long || -123.1207, zoom || 10]) //default for testing
    .then(res => res.rows[0])
    .catch(() => { msg: "Could not insert map into database" });
};

const createNewPin = (db, userId, pinData) => {
  const { mapId, title, description, imgUrl, lat, long } = pinData;
  return db.query(`
  INSERT INTO pins (map_id, user_id, title, description, img_url, lat, long) VALUES
  ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `, [mapId, userId || 1, title, description, imgUrl, lat, long])
    .then(res => res.rows[0])
    .catch(() => { msg: "Could not insert pin into database" });
}

// in the future save this in memory somehow
const _getPinOwnerId = (db, pinId) => {
  return db.query(`SELECT user_id as owner_id FROM pins WHERE id = $1`,[pinId])
    .then(res => res.rows[0].owner_id)
    .catch(() => { msg: "Could not get pin owner_id from database" });
}

const _checkUserOwnsPin = (db, userId, pinId) => {
  return _getPinOwnerId(db, pinId)
    .then(ownerId => {
      if (userId === ownerId) {
        return Promise.resolve(ownerId);
      }
      return Promise.reject({ msg: "User does not own pin" });
    });
}

const editPin = (db, userId, pinId, pinData) => {
  return _checkUserOwnsPin(db, userId, pinId)
    .then(id => {
      const { title, description, imgUrl} = pinData;
      return db.query(`
      UPDATE pins
      SET title = $2,
          description = $3,
          img_url = $4
      WHERE id = $1
      RETURNING *
      `, [pinId, title, description, imgUrl])
        .catch(() => { msg: "Could not update pin in database" })
    })
    .then(res => res.rows[0]);
}

const deletePin = (db, userId, pinId) => {
  return _checkUserOwnsPin(db, userId, pinId)
    .then(id => {
      return db.query(`
      DELETE FROM pins
      WHERE id = $1
      RETURNING *
      `, [pinId])
        .catch(() => { msg: "Could not delete pin from database" });
    })
    .then(res => res.rows[0]);
}

module.exports = {
  createNewMap,
  createNewPin,
  editPin,
  deletePin
}
