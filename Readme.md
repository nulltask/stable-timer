
# stable-timer

A timer that is stable in any situation. e.g. tabs in background, the invisible state page.

## Supported Browsers

- Internet Explorer 11+
- Firefox 12+
- Google Chrome 20+
- Safari 6+
- iOS 6.0+
- Android 4.4+

## Installation

npm:

    $ npm install stable-timer

bower:

    $ bower install stable-timer

## Example

```js
var stable = require('stable-timer');

var timer1 = stable.setTimeout(function() {
  console.log('timer 1', new Date());
}, 500);

console.log('timer 1 is started. timer id = ', timer1);

var timer2 = stable.setInterval(function() {
  console.log('timer 2', new Date());
}, 500);

console.log('timer 2 is started. timer id = ', timer2);

var timer3 = stable.setTimeout(function() {
  // never called.
  console.log('timer 3', new Date());
}, 15000);

console.log('timer 3 is started. timer id = ', timer3);

var timer4 = stable.setInterval(function() {
  // never called.
  console.log('timer 4', new Date());
}, 15000);

console.log('timer 4 is started. timer id = ', timer4);

stable.setTimeout(function() {
  console.log('clear all timers');
  stable.clearTimeout(timer1);
  stable.clearInterval(timer2);
  stable.clearTimeout(timer3);
  stable.clearInterval(timer4);
  console.log('all timers were cleared.');
}, 10000);
```

## License

MIT
