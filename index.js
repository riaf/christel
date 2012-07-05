/**
 * index.js
 *
 * @package christel
 * @author Keisuke SATO <riaf@me.com>
 */

var irc    = require('irc');
var redis  = require('redis');
var _      = require('underscore');
var config = require('./config');

var logger = function(host, message) {
  console.log('[' + host + '] ' + message);
};

var app = {
  redis: redis.createClient()
};
var connections = {};

app.redis.on('error', function(err) {
  console.log('[Redis] Error: ' + err);
});

_.each(config.servers, function(server){
  logger(server.host, 'connection...');

  var client = new irc.Client(server.host, server.nick, _.extend({
    userName: 'christel',
    realName: 'github.com/riaf/christel',
  }, server.opts));

  _.each(server.modules, function(module) {
    logger(server.host, 'loading module: ' + module);
    var mod = require(module);
    mod(app, client);
  });

  connections[server.host] = client;
});

