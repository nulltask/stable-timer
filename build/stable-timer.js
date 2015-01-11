!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.StableTimer=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{"pseudo-function":2}],2:[function(require,module,exports){

/**
 * Module dependencies.
 */

var regex = require('function-body-regex');
var Blob = require('blob');

/**
 * Expose `PseudoFunction`.
 */

module.exports = PseudoFunction;

/**
 * `URL` object.
 */

var URL = window.URL || window.webkitURL;

/**
 * @param {Function} fn
 * @api public
 */

function PseudoFunction(fn) {
  if (!(this instanceof PseudoFunction)) return new PseudoFunction(fn);
  var result = regex.exec(fn.toString());
  if (null == result) throw new TypeError('invalid function is given.');
  this.fn = fn;
  this.body = result[1];
  this.objectURL = null;
}

/**
 * @return {String}
 * @api public
 */

PseudoFunction.prototype.toString = function() {
  if (!this.objectURL) {
    this.objectURL = this.create(this.body);
  }
  return this.objectURL;
};

/**
 * @return {String}
 * @api private
 */

PseudoFunction.prototype.create = function(body) {
  return URL.createObjectURL(new Blob([body], { type: 'text/script' }));
};

/**
 * @return {PseudoFunction}
 * @api public
 */

PseudoFunction.prototype.revoke = function() {
  if (!this.objectURL) return this;
  URL.revokeObjectURL(this.objectURL);
  this.objectURL = null;
  return this;
};

},{"blob":3,"function-body-regex":4}],3:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){

/**
 * Expose regex.
 */

module.exports = /^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/;

},{}]},{},[1])(1)
});