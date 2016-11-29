'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const boom = require('boom');

const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');

const knex = require('../knex');

// Gets all Books
router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title')
    .then(data => {
      res.status(200);
      const books = camelizeKeys(data);
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
    next(boom.create(400, 'Title cannot be blank!'));
    return;
  }
  if (!author || !author.trim()) {
    next(boom.create(400, 'Author cannot be blank!'));
    return;
  }
  if (!genre || !genre.trim()) {
    next(boom.create(400, 'Genre cannot be blank!'));
    return;
  }
  if (!description || !description.trim()) {
    next(boom.create(400, 'Description cannot be blank!'));
    return;
  }
  if (!cover_url || !cover_url.trim()) {
    next(boom.create(400, 'Cover URL cannot be blank!'));
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
  if (isNaN(id) || id > knex('books').max('id') || id < 0) {
    next(boom.create(404, 'Not Found'));
    return;
  }

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
  if (isNaN(id) || id > knex('books').max('id') || id < 0) {
    next(boom.create(404, 'Not Found'));
    return;
  }

  knex('books')
    .select('title', 'author', 'genre', 'description', 'cover_url')
    .where('id', id)
    .then(data => {
      res.send(camelizeKeys(data[0]));
      knex('books')
        .where('id', id)
        .del();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
