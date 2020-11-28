/**
 *
 * @param {*} db
 * @param {*} user_id
 */
const getUserMapInfo = (db, user_id) => {
  const query = `
  SELECT DISTINCT owner, maps.name AS map_name, maps.latitude, maps.longitude, maps.created_at, maps.views
  FROM users
  LEFT OUTER JOIN favorites ON users.id=favorites.user_id
  LEFT OUTER JOIN pins ON users.id=pins.user_id
  LEFT OUTER JOIN maps ON (favorites.map_id=maps.id OR pins.map_id=maps.id)
  JOIN (
    SELECT users.id AS id, users.name AS owner FROM
    users JOIN maps ON users.id=maps.owner_id
  ) AS owners ON maps.owner_id=owners.id
  WHERE users.id = $1
  AND (favorites.favorited OR (pins.id IS NOT NULL AND favorites.favorited IS NULL))
  ORDER BY maps.views DESC;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows);
};

/** updateFavorite uses a user id and a map id to insert or update a favorites row,
 *
 * @param {*} db
 * @param {*} user_id
 * @param {*} map_id
 */
const updateFavorite = (db,user_id,map_id) => {
  const query = `
  UPDATE favorites SET favorited = NOT favorited
  WHERE favorites.user_id = $1
  AND favorites.map_id = $2
  RETURNING favorited;
  `;
  return db.query(query,[user_id, map_id])
    .then(res => {
      if (!res.rows[0]) {
        query = `INSERT INTO favorites (user_id, map_id) VALUES ($1, $2)
        RETURNING favorited;`;
        return db.query(query,[user_id, map_id]).then(res => res.rows[0]);
      }
      return res.rows[0];
    });
};

module.exports = {
  getUserMapInfo,
  updateFavorite
};
