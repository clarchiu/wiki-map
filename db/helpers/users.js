/** obtains all of the information about a user's favorited maps or maps they have contributed to.
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of the user
 */
const getUserMapInfo = (db, user_id) => {
  const query = `
  SELECT DISTINCT owners.id, owner, maps.name AS map_name, maps.latitude, maps.longitude, maps.created_at, maps.views
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

/** obtains all of the user's favorited maps
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of user
 */
const getUserMapFavorites = (db, user_id) => {
  const query = `
  SELECT DISTINCT creator_id, creator_name, maps.id, maps.name, maps.latitude, maps.longitude, maps.created_at, maps.views, favorited
  FROM users
  JOIN favorites ON users.id=favorites.user_id
  JOIN maps ON favorites.map_id=maps.id
  JOIN (
    SELECT users.id AS creator_id, users.name AS creator_name FROM
    users JOIN maps ON users.id=maps.owner_id
  ) AS creators ON maps.owner_id=creator_id
  WHERE users.id = $1
  AND favorited
  ORDER BY maps.views DESC;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows);
};

/** obtains the user's maps that they have contributed to via pin additions.
 * Maps that have been contributed to but have had those contributions deleted
 * will not be selected.
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of the user
 */
const getUserPinnedMaps = (db, user_id) => {
  const query = `
  SELECT DISTINCT creator_id, creator_name, maps.id, maps.name, maps.latitude, maps.longitude, maps.created_at, maps.views, favorited
  FROM users
  JOIN pins ON users.id=pins.user_id
  JOIN maps ON pins.map_id=maps.id
  LEFT OUTER JOIN favorites ON maps.id=favorites.map_id AND pins.user_id=favorites.user_id
  JOIN (
    SELECT users.id AS creator_id, users.name AS creator_name FROM
    users JOIN maps ON users.id=maps.owner_id
  ) AS creators ON maps.owner_id=creator_id
  WHERE users.id = $1
  ORDER BY maps.views DESC;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows);
};

/** obtains the maps created by the user.
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of the user
 */
const getUserOwnedMaps = (db, user_id) => {
  const query = `
  SELECT users.id AS creator_id, users.name AS creator, maps.name, maps.latitude, maps.longitude, maps.created_at, maps.views
  FROM users
  JOIN maps ON users.id=maps.owner_id
  WHERE users.id = $1
  ORDER BY maps.views DESC;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows);
};

/** updateFavorite uses a user id and a map id to insert or update a favorites row.
 * The favorites row will be updated if it exists, otherwise it will be inserted.
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of the user
 * @param {*} map_id id of the map
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
  getUserMapFavorites,
  getUserPinnedMaps,
  getUserOwnedMaps,
  updateFavorite,
};
