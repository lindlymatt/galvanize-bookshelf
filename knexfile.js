'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_dev'
  },
  test: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_test'
  },
  production: {
    client: 'pg',
    connection: 'postgres://zddnvekehqgmcs:d4crROc5ABAjs8sYdhGRg2-Gh5@ec2-54-243-217-22.compute-1.amazonaws.com:5432/d9u9ic1ilhs9bc'
  }
};
