/**
 * Get all map data from db and return as Promise
 * @param {*} db
 */
const getAllMaps = (db, uid, map_name = "") => {
  return db.query(`
    SELECT users.name as creator_name, users.id as creator_id, maps.*, favorited
    FROM maps
    JOIN users ON owner_id = users.id
    LEFT JOIN (
      SELECT *
      FROM favorites
      WHERE favorites.user_id = $1
    ) as user_favorites ON maps.id = user_favorites.map_id
    WHERE LOWER(maps.name) LIKE $2
    ORDER BY maps.views DESC
  `, [uid, `%${map_name}%`])
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
const _getPinsOnMap = (db, map) => {
  return db.query(`
    SELECT pins.*, users.name as owner_name
    FROM pins
    JOIN users ON pins.user_id = users.id
    WHERE map_id = $1
  `, [map.id])
    .then(res => {
      map.pins = res.rows;
      return map;
    })
    .catch(() => { msg: "Could not load pins" });
}

/**
 * Given a map id, query the db for its data
 * Then chain together with _getPinsOnMap to add pins data as an array in the object
 * Return as Promise
 * @param {*} db
 * @param {*} id
 */
const getMapById = (db, id) => {
  return db.query(`SELECT * FROM maps WHERE id = $1`, [id])
    .then(res => res.rows[0])
    .then(map => _getPinsOnMap(db, map))
    .catch(err => err || { msg: `Could not get map with id: ${id} from database` });
};

const getOwner = (db, map_id) => {
  const query = `
  SELECT users.name AS username, email, authenticated FROM users JOIN maps ON users.id=maps.owner_id
  WHERE maps.id=$1
  `;
  return db.query(query, [map_id])
    .then(res => res.rows[0])
    .catch(err => err || { msg: `Could not get an owner for map_id: ${map_id} from database` });
};

module.exports = {
  getAllMaps,
  getMapById,
  getOwner,
};
