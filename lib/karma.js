/**
 * karma.js
 *
 * @package christel
 * @author Keisuke SATO <riaf@me.com>
 */

module.exports = function(app, client) {

  // require redis
  if (!('redis' in app) || !app.redis) {
    return false;
  }

  var storeKey = function(key) {
    return 'chlistel:karma:' + key;
  };

  var dumpKarma = function(nick, to) {
    app.redis.get(storeKey(nick), function(err, data) {
      if (data) {
        data = JSON.parse(data);
        client.notice(to, nick + ': ' + data.total + ' (++: ' + data.plus + ', --: ' + data.minus + ')')
      } else {
        client.notice(to, nick + ': 0');
      }
    });
  };

  client.addListener('message', function (from, to, message) {
    if (message.match(/(\S+)(\+\+|\-\-)/i)) {
      var nick = RegExp.$1;
      var op = RegExp.$2;

      app.redis.get(storeKey(nick), function(err, data) {
        if (data) {
          data = JSON.parse(data);
        } else {
          data = {
            total: 0,
            plus: 0,
            minus: 0,
            attrs: {}
          };
        }

        if (!(from in data.attrs)) {
          data.attrs[from] = {
            plus: 0,
            minus: 0
          };
        }

        switch (op) {
          case '++':
            data.total += 1;
            data.plus += 1;
            data.attrs[from].plus += 1;
            break;

          case '--':
            data.total -= 1;
            data.minus += 1;
            data.attrs[from].minus += 1;
            break;
        }

        app.redis.set(storeKey(nick), JSON.stringify(data), function() {
          dumpKarma(nick, to);
        });
      });
    } else if (message.match(/^Karma for (\S+)$/i)) {
      var nick = RegExp.$1;
      dumpKarma(nick, to);
    }
  });
};

