'use strict';

const express = require('express');
const knex = require('../knex');
const boom = require('boom');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/favorites', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.setHeader('Content-Type', 'text/plain');
    next(boom.create(401, 'Unauthorized'));
  }

  jwt.verify((req.cookies.token), process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded === undefined) {
      next(err);
    } else {
      knex('favorites')
        .join('books', 'books.id', '=', 'favorites.book_id')
        .join('users', 'users.id', '=', 'favorites.user_id')
        .where('users.email', decoded.email)
        .select('favorites.id', 'favorites.book_id', 'favorites.user_id', 'users.created_at', 'users.updated_at', 'books.title', 'books.author', 'books.genre', 'books.description', 'books.cover_url')
        .then(data => {
          res.send(camelizeKeys(data));
        })
        .catch(err => {
          next(err);
        });
    }
  });
});

// req.query.<thing>
router.get('/favorites/check', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.setHeader('Content-Type', 'text/plain');
    next(boom.create(401, 'Unauthorized'));
  }

  jwt.verify((req.cookies.token), process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded === undefined) {
      next(err);
    } else {
      knex('favorites')
        .join('books', 'books.id', '=', 'favorites.book_id')
        .join('users', 'users.id', '=', 'favorites.user_id')
        .where('users.email', decoded.email)
        .andWhere('books.id', req.query.bookId)
        .then(data => {
          if (data.length !== 0) {
            res.send(true);
          } else {
            res.send(false);
          }
        })
        .catch(err => {
          next(err);
        });
    }
  });
});

router.post('/favorites', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.setHeader('Content-Type', 'text/plain');
    next(boom.create(401, 'Unauthorized'));
  }

  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    const bookId = req.body.bookId;
    if (err || decoded === undefined) {
      next(err);
    } else {
      knex('users')
        .where('email', decoded.email)
        .then(results => {
          let userId = results[0].id;
          return knex('favorites')
            .join('books', 'books.id', '=', 'favorites.book_id')
            .join('users', 'users.id', '=', 'favorites.user_id')
            .where('users.email', decoded.email)
            .andWhere('books.id', bookId)
            .then(data => {
              if (data.length === 0) {
                knex('favorites')
                  .insert({ book_id: bookId, user_id: userId })
                  .then(data => {
                    return knex('favorites')
                      .where('book_id', bookId)
                      .then(rows => {
                        res.send(camelizeKeys(rows[0]));
                      })
                      .catch(err => {
                        next(err);
                      });
                  })
                  .catch(err => {
                    next(err);
                  })
              } else {
                next(boom.create(401, 'Unauthorized'));
              }
            })
            .catch(err => {
              next(err);
            });
        })
        .catch(err => {
          next(err);
        });
    };
  });
});

router.delete('/favorites', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.setHeader('Content-Type', 'text/plain');
    next(boom.create(401, 'Unauthorized'));
  }

  jwt.verify((req.cookies.token), process.env.JWT_SECRET, (err, decoded) => {
    const bookId = req.body.bookId;

    if (err || decoded === undefined) {
      next(err);
    } else {
      knex('favorites')
        .join('books', 'books.id', '=', 'favorites.book_id')
        .join('users', 'users.id', '=', 'favorites.user_id')
        .select('favorites.user_id', 'favorites.book_id')
        .where('users.email', decoded.email)
        .andWhere('books.id', bookId)
        .then(data => {
          res.send(camelizeKeys(data[0]));
          return knex('favorites')
            .del()
            .where('book_id', bookId);
        })
        .catch(err => {
          next(err);
        });
    }
  });
});


module.exports = router;
