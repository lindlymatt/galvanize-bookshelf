'use strict';

exports.up = function (knex, Promise) {
  return knex.schema.createTable('favorites', table => {
    // Create columns for id, author, genre, description, cover_url, created_at and updated_at.
    table.increments();
    table.integer('book_id').notNullable()
      .references('id')
      .inTable('books').onDelete('cascade').index();
    table.integer('user_id').notNullable()
      .references('id')
      .inTable('users').onDelete('cascade').index();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIFExists('favorites');
};
