/*
 * All routes for Maps are defined here
 * Since this file is loaded in server.js into /maps,
 *   these routes are mounted onto /maps
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const checkUserAuthenticated = (req, onFalse, onTrue) => {
  return req.session.isAuthenticated;
}

module.exports = (db) => {
  // show index with all maps
  router.get("/", (req, res) => {
    //query database to show all maps
    //render index.html
    getAllMaps(db)
      .then (maps => {
        res.render("maps_index", { maps });
      })
      .catch (err => {
        res
          .status(400)
          .render("error", { status: 400, msg: err.msg });
      });
  });

  // show create new map form
  router.get("/new", (req, res) => {
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("err", { status: 401, msg: "No access"});
    }
    const templateVars = {};
    res.render("maps_new", templateVars);
  });

  // show map with map_id
  router.get("/:map_id", (req, res) => {
    // query database to get details about map,
    // including all pins and data
    getMapById(db, req.params.map_id)
      .then(map => {
        res.render("map_show", map);
      })
      .catch(err => {
        res
          .status(400)
          .render("error", { status: 400, msg: err.msg });
      });
  });

  // create map
  router.post("/", (req, res) => {
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("err", { status: 401, msg: "No access"});
    }
    createNewMap(db, req) //we don't know what is being passed to the form yet
      .then(map => {
        res.redirect(`/${map.id}`);
      })
      .catch(err => {
        res
        .status(400)
        .render("error", { status: 400, msg: err.msg });
      });
  });

  // create pin
  router.post("/maps/:map_id", (req, res) => {
    // check user authenticated on client side script
    // because it'll probably be handled by leaflet
    createNewPin(db, req) // we don't know what leaflet will pass us yet
      .then(map => {
        // leaflet will add pin to the map
        console.log(map); // just console log for now
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
      });
  });

  // edit pin
  router.post("/maps/:map_id/:pin_id", (req, res) => {
    // check user authenticated on client side script
    // because it'll probably be handled by leaflet
    // check user owns pin with session cookie on client
    // plus some ajax request to query pin owner from db

    editPin(db, req) // we don't know what leaflet will pass us yet
      .then(map => {
        // leaflet will edit pin
        console.log(map); // just console log for now
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
      });
  });

  // remove pin
  router.post("/maps/:map_id/:pin_id/delete", (req, res) => {
    // check user authenticated on client side script
    // because it'll probably be handled by leaflet
    // check user owns pin with session cookie on client
    // plus some ajax request to query pin owner from db

    deletePin(db, req) // we don't know what leaflet will pass us yet
      .then(map => {
        // leaflet will delete pin
        console.log(map); // just console log for now
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
      });
  });


  return router;
};
