const getAllMaps = (db) => {
  return db.query(`SELECT * FROM maps`)
    .then((res) => {
      return res.rows;
    })
    .catch(() => { msg: "Could not get maps from database" });
};

const getPinsByMap = (db, map) => {
  return db.query(`SELECT * FROM pins WHERE map_id = $1`, [map.id])
    .then(res => {
      map.pins = res.rows;
      return map;
    });
}

const getMapById = (db, id) => {
  return db.query(`SELECT * FROM maps WHERE id = $1`, [id])
    .then(res => res.rows[0])
    .then(map => getPinsByMap(db, map))
    .catch(() => { msg: `Could not get map with id: ${id} from database` });
};

module.exports = {
  getAllMaps,
  getMapById
}
