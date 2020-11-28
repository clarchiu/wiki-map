/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { getUserMapInfo, updateFavorite } = require('../db/helpers/users');

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

  // GET /:id, used for getting a user's profile
  router.get("/:id", (req, res) => {
    getUserMapInfo(db, req.params.id)
      .then(data => {
        res.render('user.ejs', { data });
      })
      .catch(err => {
        res
          .status(500)
          .render('error.ejs', { status: 500, msg: err.message });
      });
  });

  // POST /:id/favorite, used for added/removing a map from a user's favorites list
  router.post("/:id/favorite", (req, res) => {
    if (!req.session.user_id || req.session.user_id !== req.params.id) {
      return res.status(401).render('error.ejs', { status: 401, msg: 'unauthorized access' });
    }
    updateFavorite(db, req.params.id,req.body.id)
      .then(isFav => res.json(isFav))
      .catch(err => {
        res
          .status(500)
          .render('error.ejs', { status: 500, msg: err.message });
      });
  });

  // POST /login/:id, used for logging into a user account. Purely for testing.
  router.post("/login/:id", (req, res) => {
    req.session.user_id = req.params.id;
    res.redirect('/');
  });


  return router;
};
