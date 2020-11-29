/**
 * Get all map data from db and return as Promise
 * @param {*} db
 */
const getAllMaps = (db, uid) => {
  return db.query(`
  SELECT maps.*, favorited
  FROM maps
  LEFT JOIN (
    SELECT *
    FROM favorites
    WHERE favorites.user_id = $1
  ) as user_favorites ON maps.id = user_favorites.map_id
  `, [uid])
    .then((res) => {
      return res.rows;
    })
    .catch(() => { msg: "Could not get maps from database" });
};

/**
 * Private (for now) - to be used by getMapById only
 * Given a map object, query its pins from db and append result as an entry
 * in the map object and return as Promise
 * @param {*} db
 * @param {*} map
 */
const _getPinsByMap = (db, map) => {
  return db.query(`SELECT * FROM pins WHERE map_id = $1`, [map.id])
    .then(res => {
      map.pins = res.rows;
      return map;
    });
}

/**
 * Given a map id, query the db for its data
 * Then chain together with _getPinsByMap to add pins data as an array in the object
 * Return as Promise
 * @param {*} db
 * @param {*} id
 */
const getMapById = (db, id) => {
  return db.query(`SELECT * FROM maps WHERE id = $1`, [id])
    .then(res => res.rows[0])
    .then(map => _getPinsByMap(db, map))
    .catch(() => { msg: `Could not get map with id: ${id} from database` });
};

module.exports = {
  getAllMaps,
  getMapById
}
