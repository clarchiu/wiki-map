/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const {
  getExistingUser,
  getUserMapFavorites,
  getUserFavorites,
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
      return res.status(400).render('error.ejs', { status: 400, msg: 'please log in to see your profile' });
    }
    res.redirect(`/users/${req.session.user_id}`);
  });

  router.get("/me/json", (req, res) => {
    if (!req.session.user_id) {
      return res.json({});
    }
    res.json({ user_id: req.session.user_id, isAuth: req.session.isAuthenticated });
  });

  router.get("/me/favorites", (req, res) => {
    if (!req.session.user_id) {
      return res.json([{}]);
    }
    getUserFavorites(db, req.session.user_id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  });

  // GET /login/:id, used for logging into a user account. Purely for testing.
  router.get("/login/:id", (req, res) => {
    getExistingUser(db, req.params.id)
      .then(data => {
        if (!data) return res.status(401).render('error.ejs', {status: 401, msg: 'unauthorized'});
        req.session.user_id = data.id;
        req.session.name = data.name;
        req.session.email = data.email;
        req.session.isAuthenticated = data.authenticated;
        res.redirect('/');
      })
      .catch(err => {
        res.status(500).render('error.ejs', err);
      })
  });

  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  // GET /:id, used for getting a user's profile
  router.get("/:id", (req, res) => {
    getExistingUser(db, req.params.id)
      .then(data => {
        if (!data) return res.status(404).render('error.ejs', {status: 404, msg: 'not found'});
        res.render('user.ejs', {...data});
      })
      .catch(err => {
        res.status(500).render('error.ejs', err);
      });
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
      return res.status(401).json({ status: 401, msg: 'please log in to add maps to your favorites' });
    }
    updateFavorite(db, req.session.user_id,req.params.id)
      .then(isFav => res.json(isFav))
      .catch(err => {
        res
          .status(500)
          .render('error.ejs', { status: 500, msg: err.message });
      });
  });

  return router;
};
