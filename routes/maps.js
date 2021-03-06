/*
 * All routes for Maps are defined here
 * Since this file is loaded in server.js into /maps,
 *   these routes are mounted onto /maps
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const { getAllMaps, getMapById, getOwner } = require('../db/helpers/maps-get.js');
const { createNewMap, createNewPin, editPin, deletePin, incrementViews } = require('../db/helpers/maps-post.js');

const checkUserAuthenticated = (req) => {
  return req.session.isAuthenticated;
}

const parseMapFormData = (req) => {
  const { name, long, lat, zoom } = req.body;
  const ownerId = req.session.user_id;
  return { ownerId, name, long, lat, zoom }
}

const parsePinFormData = (req) => {
  const mapId = req.params.map_id;
  const { title, description, imgUrl, lat, long } = req.body;
  return { mapId, title, description, imgUrl, lat, long };
}

module.exports = (db) => {
  // show index with all maps
  router.get("/", (req, res) => {
    res.render("index", {user: req.session.name, email: req.session.email,});
  });

  router.get("/json", (req, res) => {
    getAllMaps(db, req.session.user_id, req.query.search)
      .then (maps => {
        res.json(maps);
      })
      .catch (err => {
        res
          .status(500)
          .render("error", { user: req.session.name, email: req.session.email, status: 500, msg: err.msg });
      });
  });

  // show create new map form
  router.get("/new", (req, res) => {
    if (!checkUserAuthenticated(req)) {
      return res
        .status(401)
        .render("error", { user: req.session.name, email: req.session.email, status: 401, msg: "No access"});
    }
    res.render("maps_new", {user: req.session.name, email: req.session.email,});
  });

  // show map with map_id
  router.get("/:map_id", (req, res) => {
    incrementViews(db, req.params.map_id)
      .then((data) => {
        if (!data || !data.id) return res.status(404).render('error', { user: req.session.name, email: req.session.email, status: 404, msg: 'map not found' });
        res.render("map_show", {user: req.session.name, email: req.session.email,});
      });
  });

  router.get("/:map_id/json", (req, res) => {
    // query database to get details about map,
    // including all pins and data
    let mapInfo = {};
    getMapById(db, req.params.map_id)
      .then(map => {
        mapInfo = { ...map };
        return getOwner(db, req.params.map_id);
      })
      .then(owner => {
        res.json({...mapInfo, ...owner});
      })
      .catch(err => {
        res
          .status(500)
          .render("error", { user: req.session.name, email: req.session.email, status: 400, msg: err.msg });
      });
  });

  // to test: curl -d name='Van' -d lat='50' -d long='50' http://localhost:8080/maps
  // create map
  router.post("/", (req, res) => {
    if (!checkUserAuthenticated(req)) {
      return res
        .status(401)
        .render("error", { user: req.session.name, email: req.session.email, status: 401, msg: "No access"});
    }
    createNewMap(db, parseMapFormData(req))
      .then(map => {
        res.redirect(`/maps/${map.id}`);
      })
      .catch(err => {
        res
        .status(500)
        .render("error", {user: req.session.name, email: req.session.email, status: 500, msg: err.msg });
      });
  });

  // to test: curl -d title='test' -d description='test' -d imgUrl='test' -d lat='50' -d long='50' http://localhost:8080/maps/1
  // create pin
  router.post("/:map_id", (req, res) => {
    // check user authenticated on client side script also
    if (!checkUserAuthenticated(req)) {
      return res
        .status(401)
        .render("error", { user: req.session.name, email: req.session.email, status: 401, msg: "No access"});
    }
    createNewPin(db, req.session.user_id, parsePinFormData(req))
      .then(pin => {
        // leaflet will add pin to the map
        console.log(pin); // just console log for now
        res.json(pin);
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
    if (!checkUserAuthenticated(req)) {
      return res
        .status(401)
        .render("error", { user: req.session.name, email: req.session.email, status: 401, msg: "No access"});
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
    if (!checkUserAuthenticated(req)) {
      return res
        .status(401)
        .render("error", { user: req.session.name, email: req.session.email, status: 401, msg: "No access"});
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
