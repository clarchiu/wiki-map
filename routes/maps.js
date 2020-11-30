/*
 * All routes for Maps are defined here
 * Since this file is loaded in server.js into /maps,
 *   these routes are mounted onto /maps
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const { getAllMaps, getMapById } = require('../db/helpers/maps-get.js');
const { createNewMap, createNewPin, editPin, deletePin } = require('../db/helpers/maps-post.js');

const checkUserAuthenticated = (req) => {
  return req.session.isAuthenticated;
}

const parseMapFormData = (req) => {
  const { name, long, lat } = req.body;
  const ownerId = req.session.user_id;
  return { ownerId, name, long, lat }
}

const parsePinFormData = (req) => {
  const mapId = req.params.map_id;
  const { title, description, imgUrl, lat, long } = req.body;
  return { mapId, title, description, imgUrl, lat, long };
}

module.exports = (db) => {
  // show index with all maps
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/json", (req, res) => {
    getAllMaps(db, req.session.user_id)
      .then (maps => {
        res.json(maps);
      })
      .catch (err => {
        res
          .status(500)
          .render("error", { status: 500, msg: err.msg });
      });
  });

  // show create new map form
  router.get("/new", (req, res) => {
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("error", { status: 401, msg: "No access"});
    }
    const templateVars = {};
    res.render("maps_new", templateVars);
  });

  // show map with map_id
  router.get("/:map_id", (req, res) => {
    res.render("map_show");
  });

  router.get("/:map_id/json", (req, res) => {
    // query database to get details about map,
    // including all pins and data
    getMapById(db, req.params.map_id)
      .then(map => {
        res.json(map);
      })
      .catch(err => {
        res
          .status(500)
          .render("error", { status: 400, msg: err.msg });
      });
  });

  // to test: curl -d name='Van' -d lat='50' -d long='50' http://localhost:8080/maps
  // create map
  router.post("/", (req, res) => {
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("error", { status: 401, msg: "No access"});
    }
    createNewMap(db, parseMapFormData(req)) //we don't know what is being passed to the form yet
      .then(map => {
        res.redirect(`/maps/${map.id}`);
      })
      .catch(err => {
        res
        .status(500)
        .render("error", {status: 500, msg: err.msg });
      });
  });

  // to test: curl -d title='test' -d description='test' -d imgUrl='test' -d lat='50' -d long='50' http://localhost:8080/maps/1
  // create pin
  router.post("/:map_id", (req, res) => {
    // check user authenticated on client side script also
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("error", { status: 401, msg: "No access"});
    }
    createNewPin(db, req.session.user_id, parsePinFormData(req))
      .then(pin => {
        // leaflet will add pin to the map
        console.log(pin); // just console log for now
        res.send(pin);
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
        res.status(500).send(err.msg)
      });
  });

  // to test: curl -d title='changed' -d description='test' -d imgUrl='test' http://localhost:8080/maps/1/9
  // edit pin
  router.post("/:map_id/:pin_id", (req, res) => {
    // check user authenticated on client side script
    // check user owns pin with session cookie on client
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("error", { status: 401, msg: "No access"});
    }
    editPin(db, req.session.user_id, req.params.pin_id, parsePinFormData(req)) // we don't know what leaflet will pass us yet
      .then(pin => {
        // leaflet will edit pin
        console.log(pin); // just console log for now
        res.json(pin);
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
        res.status(500).send(err.msg)
      });
  });

  // to test: curl -X POST http://localhost:8080/maps/1/9/delete
  // remove pin
  router.post("/:map_id/:pin_id/delete", (req, res) => {
    // check user authenticated on client side script
    // check user owns pin with session cookie on client
    if (!checkUserAuthenticated) {
      return res
        .status(401)
        .render("error", { status: 401, msg: "No access"});
    }
    deletePin(db, req.session.user_id, req.params.pin_id) // we don't know what leaflet will pass us yet
      .then(pin => {
        // leaflet will delete pin
        console.log(pin); // just console log for now
        res.json(pin);
      })
      .catch(err => {
        // need some client side javascript to show error msg
        // instead of rendering out a whole new page
        res.status(500).send(err.msg)
      });
  });

  return router;
};
