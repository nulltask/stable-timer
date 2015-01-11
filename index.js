
/**
 * Module dependencies.
 */

var pfn = require('pseudo-function');

/**
 * Worker function for `setTimeout`.
 */

var timeout = pfn(function() {
  var timerId = null;
  self.onmessage = function(e) {
    if (timerId) {
      timerId = clearTimeout(timerId);
      return;
    }
    timerId = setTimeout(function() {
      self.postMessage(0);
    }, e.data);
  };
});

/**
 * Worker function for `setInterval`.
 */

var interval = pfn(function() {
  var timerId = null;
  self.onmessage = function(e) {
    if (timerId) {
      timerId = clearInterval(timerId);
      return;
    }
    timerId = setInterval(function() {
      self.postMessage(0);
    }, e.data);
  };
});

/**
 * Timer ID.
 */

var id = 0;

/**
 * Timer references.
 */

var timers = {};

/**
 * Expose `StableInterval`.
 */

exports.StableInterval = StableInterval;

/**
 * Expose `StableTimeout`.
 */

exports.StableTimeout = StableTimeout;

/**
 * @param {Function} fn
 * @param {Number} ms
 * @return {Number}
 * @api public
 */

exports.setInterval = function(fn, ms) {
  var timer = new StableInterval();
  timers[timer.id] = timer;
  timer.set(fn, ms || 0);
  return timer.id;
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
  var timer = new StableTimeout();
  timers[timer.id] = timer;
  timer.set(fn, ms || 0);
  return timer.id;
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

/**
 * @api private
 */

function StableInterval() {
  if (!(this instanceof StableInterval)) return new StableInterval();
  this.id = id++;
};

/**
 * @param {Function} fn
 * @param {Number} ms
 * @api private
 */

StableInterval.prototype.set = function(fn, ms) {
  if (this.worker) throw new Error('callback is already registered.');
  this.worker = new Worker(interval);
  this.worker.onmessage = fn;
  this.worker.postMessage(ms);
};

/**
 * @api private
 */

StableInterval.prototype.clear = function() {
  if (!this.worker) return;
  this.worker.postMessage(void 0);
  this.worker = null;
};

/**
 * @api private
 */

function StableTimeout() {
  if (!(this instanceof StableTimeout)) return new StableTimeout();
  this.id = id++;
}

/**
 * @param {Function} fn
 * @param {Number} ms
 * @api private
 */

StableTimeout.prototype.set = function(fn, ms) {
  if (this.worker) throw new Error('callback is already registered.');
  this.worker = new Worker(timeout);
  this.worker.onmessage = fn;
  this.worker.postMessage(ms);
};

/**
 * @api private
 */

StableTimeout.prototype.clear = function() {
  if (!this.worker) return;
  this.worker.postMessage(void 0);
  this.worker = null;
};
