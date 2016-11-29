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

router.get('/token', (req, res, next) => {

});

router.post('/token', (req, res, next) => {

});

module.exports = router;
