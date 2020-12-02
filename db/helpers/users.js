/** obtains all of the user's favorited maps
 *
 * @param {*} db postgres database object
 * @param {*} user_id id of user
 */
const getUserMapFavorites = (db, user_id) => { // TODO: third join is redundant
  const query = `
  SELECT DISTINCT creator_id, creator_name, maps.*
  FROM favorites
  JOIN maps ON favorites.map_id=maps.id
  JOIN (
    SELECT users.id AS creator_id, users.name AS creator_name FROM
    users JOIN maps ON users.id=maps.owner_id
  ) AS creators ON maps.owner_id=creator_id
  WHERE favorites.user_id = $1
  AND favorited
  ORDER BY maps.views DESC;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows);
};

const getExistingUser = (db, user_id) => {
  const query = `
  SELECT id, name, email, authenticated
  FROM users
  WHERE users.id = $1;
  `;
  return db.query(query,[ user_id ])
    .then(res => res.rows[0]);
};

const getUserFavorites = (db, user_id) => {
  const query = `
  SELECT DISTINCT map_id, favorited
  FROM favorites
  WHERE favorites.user_id = $1
  AND favorited
  ORDER BY map_id;
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
const getUserPinnedMaps = (db, user_id) => { // TODO: third join is redundant
  const query = `
  SELECT DISTINCT creator_id, creator_name, maps.*
  FROM pins
  JOIN maps ON pins.map_id=maps.id
  LEFT OUTER JOIN favorites ON maps.id=favorites.map_id AND pins.user_id=favorites.user_id
  JOIN (
    SELECT users.id AS creator_id, users.name AS creator_name FROM
    users JOIN maps ON users.id=maps.owner_id
  ) AS creators ON maps.owner_id=creator_id
  WHERE pins.user_id = $1
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
  SELECT users.id AS creator_id, users.name AS creator, maps.*
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
  let query = `
  UPDATE favorites SET favorited = NOT favorited
  WHERE favorites.user_id = $1
  AND favorites.map_id = $2
  RETURNING favorited;
  `;
  return db.query(query,[user_id, map_id])
    .then(res => {
      if (!res.rows[0]) {
        query = `INSERT INTO favorites (user_id, map_id, favorited) VALUES ($1, $2, true)
        RETURNING favorited;`;
        return db.query(query,[user_id, map_id]).then(res => res.rows[0]);
      }
      return res.rows[0];
    });
};

module.exports = {
  getExistingUser,
  getUserMapFavorites,
  getUserFavorites,
  getUserPinnedMaps,
  getUserOwnedMaps,
  updateFavorite,
};
