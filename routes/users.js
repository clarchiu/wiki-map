/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const {
  getUserMapInfo,
  getUserMapFavorites,
  getUserPinnedMaps,
  getUserOwnedMaps,
  updateFavorite,
} = require('../db/helpers/users');

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/me", (req, res) => {
    if (!req.session.user_id) {
      return res.status(400).render('error.ejs', { status: 400, msg: 'Please log in to see your profile' });
    }
    res.redirect(`/users/${req.session.user_id}`);
  });

  // GET /:id, used for getting a user's profile
  router.get("/:id", (req, res) => {
    res.render('user.ejs');
  });

  router.get("/:id/favorites", (req, res) => {
    getUserMapFavorites(db, req.params.id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  });

  router.get("/:id/contributions", (req, res) => {
    getUserPinnedMaps(db, req.params.id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  });

  // POST /:id/favorite, used for added/removing a map from a user's favorites list
  router.post("/:id/favorite", (req, res) => {
    if (!req.session.user_id || !req.params.id) {
      return res.status(401).render('error.ejs', { status: 401, msg: 'unauthorized access' });
    }
    updateFavorite(db, req.session.user_id,req.params.id)
      .then(isFav => res.json(isFav))
      .catch(err => {
        res
          .status(500)
          .render('error.ejs', { status: 500, msg: err.message });
      });
  });

  // GET /login/:id, used for logging into a user account. Purely for testing.
  router.get("/login/:id", (req, res) => {
    req.session.user_id = req.params.id;
    res.redirect('/');
  });


  return router;
};
