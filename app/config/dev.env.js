'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_SPOTIFY_CLIENT_ID: JSON.stringify(
    process.env.VUE_APP_SPOTIFY_CLIENT_ID
  )
});
