'use strict';

const express = require('express');
const knex = require('../knex');
const boom = require('boom');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/token', (req, res, next) => {
  // Tests if a Cookie exists, if not; send a false.
  if (!req.cookies.token) {
    res.status(200).send(false);
  } else {
    res.status(200).send(true);
  }
});

router.post('/token', (req, res, next) => {
  const {
    email,
    password
  } = decamelizeKeys(req.body);

  if (!email || !email.trim()) {
    next(boom.create(400, 'Email must not be blank'));
    return;
  }
  if (!password || !password.trim()) {
    next(boom.create(400, 'Password must not be blank'));
    return;
  }

  knex('users')
    .where('email', '=', email)
    .then(data => {
      if (data.length > 0) {
        bcrypt.compare(password, data[0].hashed_password, function (e, r) {
          if (r === true) {
            return knex('users')
              .select('id', 'email', 'first_name', 'last_name')
              .where('email', '=', email)
              .first()
              .then(results => {
                let token = jwt.sign({ email: email, password: data[0].hashed_password }, process.env.JWT_SECRET);
                res.cookie('token', token, { httpOnly: true });
                res.send(camelizeKeys(results));
              })
              .catch(err => {
                next(err);
              });
          } else {
            next(boom.create(400, 'Bad email or password'));
          }
        });
      } else {
        next(boom.create(400, 'Bad email or password'));
      }
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/token', (req, res, next) => {
  res.clearCookie('token');
  res.status(200).send(true);
});

module.exports = router;
