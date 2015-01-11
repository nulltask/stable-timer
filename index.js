
/**
 * Module dependencies.
 */

var StableTimeout = require('stable-timeout');
var StableInterval = require('stable-interval');

/**
 * Timer ID.
 */

var id = 0;

/**
 * Timer references.
 */

var timers = {};

/**
 * @param {Function} fn
 * @param {Number} ms
 * @return {Number}
 * @api public
 */

exports.setInterval = function(fn, ms) {
  var timerId = id++;
  var timer = new StableInterval();
  timers[timerId] = timer;
  timer.set(fn, ms || 0);
  return timerId;
};

/**
 * @param {Number} id
 * @return {Boolean}
 * @api public
 */

exports.clearInterval = function(id) {
  var timer = timers[id];
  if (!timer) return;
  timer.clear();
  return delete timers[id];
};

/**
 * @param {Function} fn
 * @param {Number} ms
 * @return {Number}
 * @apu public
 */

exports.setTimeout = function(fn, ms) {
  var timerId = id++;
  var timer = new StableTimeout();
  timers[timerId] = timer;
  timer.set(fn, ms || 0);
  return timerId;
};

/**
 * @param {Number} id
 * @return {Boolean}
 * @api public
 */

exports.clearTimeout = function(id) {
  var timer = timers[id];
  if (!timer) return;
  timer.clear();
  return delete timers[id];
};
