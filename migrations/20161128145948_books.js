'use strict';

exports.up = function (knex, Promise) {
  return knex.schema.createTable('books', table => {
    // Create columns for id, author, genre, description, cover_url, created_at and updated_at.
    table.increments();
    table.string('title').notNullable().defaultTo('');
    table.string('author').notNullable().defaultTo('');
    table.string('genre').notNullable().defaultTo('');
    table.text('description').notNullable().defaultTo('');
    table.text('coverUrl').notNullable().defaultTo('');
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('books');
};
