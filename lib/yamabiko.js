/**
 * yamabiko.js
 *
 * @package christel
 * @author Keisuke SATO <riaf@me.com>
 */

module.exports = function(app, client) {
  client.addListener('message', function (from, to, message) {
    client.say(to, message);
  });
};
