'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const boom = require('boom');
const { camelizeKeys, decamelizeKeys } = require('humps');

const knex = require('../knex');

// Gets all Books
router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title')
    .then(data => {
      // res.status(200);
      let books = camelizeKeys(data);
      // res.setHeader('Content-Type', 'application/json');
      // res.setHeader('Accepted', 'application/json');
      res.send(books);
    })
    .catch(err => {
      next(err);
    });
});

// Gets a Single Book
router.get('/books/:id', (req, res, next) => {
  const specificBook = req.params.id;
  knex('books')
    .max('id')
    .then(data => {
      if (isNaN(specificBook) || specificBook > data[0].max || specificBook < 0) {
        next(boom.create(404, 'Not Found'));
        return;
      }
    });

  knex('books')
    .where('id', '=', specificBook)
    .then(data => {
      const book = camelizeKeys(data);
      res.send(book[0]);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  const {
    title,
    author,
    genre,
    description,
    cover_url
  } = decamelizeKeys(req.body);

  if (!title || !title.trim()) {
    next(boom.create(400, 'Title must not be blank'));
    return;
  }
  if (!author || !author.trim()) {
    next(boom.create(400, 'Author must not be blank'));
    return;
  }
  if (!genre || !genre.trim()) {
    next(boom.create(400, 'Genre must not be blank'));
    return;
  }
  if (!description || !description.trim()) {
    next(boom.create(400, 'Description must not be blank'));
    return;
  }
  if (!cover_url || !cover_url.trim()) {
    next(boom.create(400, 'Cover URL must not be blank'));
    return;
  }

  const insertBook = {
    title,
    author,
    genre,
    description,
    cover_url
  };

  knex('books')
    .insert(insertBook, '*')
    .then(rows => {
      const book = camelizeKeys(rows[0]);
      res.send(book);
    })
    .catch(err => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  const id = req.params.id;
  knex('books')
    .max('id')
    .then(data => {
      if (isNaN(id) || id > data[0].max || id < 0) {
        next(boom.create(404, 'Not Found'));
        return;
      }
    });

  const {
    title,
    author,
    genre,
    description,
    cover_url
  } = decamelizeKeys(req.body);

  const updatedBook = {
    title,
    author,
    genre,
    description,
    cover_url
  };

  knex('books')
    .where('id', id)
    .update(updatedBook, '*')
    .then(rows => {
      const book = camelizeKeys(rows[0]);
      res.send(book);
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  const id = req.params.id;

  knex('books')
    .max('id')
    .then(data => {
      if (isNaN(id) || id > data[0].max || id < 0) {
        next(boom.create(404, 'Not Found'));
        return;
      } else {
        return knex('books')
          .select('title', 'author', 'genre', 'description', 'cover_url')
          .where('id', id)
          .then(data => {
            res.send(camelizeKeys(data[0]));
            return knex('books')
              .del()
              .where('id', id);
          })
          .catch(err => {
            next(err);
          });
      }
    });
});

module.exports = router;
