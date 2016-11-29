'use strict';

const express = require('express');
const knex = require('../knex');
const boom = require('boom');
const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/users', (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
  } = decamelizeKeys(req.body);

  if (!email || !email.trim()) {
    next(boom.create(400, 'Email must not be blank'));
    return;
  }

  knex('users')
    .where('email', email)
    .then(data => {
      if (data) {
        next(boom.create(400, 'Email already exists'));
      }
    });


  if (!password || password.length < 8) {
    next(boom.create(400, 'Password must be at least 8 characters long'));
    return;
  }

  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      var hashed_password = hash;

      const newUser = {
        first_name,
        last_name,
        email,
        hashed_password
      };

      knex('users')
        .insert(newUser, '*')
        .then(data => {
          knex('users')
            .select('id', 'first_name', 'last_name', 'email')
            .where('email', email)
            .then(output => {
              res.send(camelizeKeys(output[0]));
            });
        })
        .catch(err => {
          next(err);
        });

    });
  });
});

module.exports = router;
