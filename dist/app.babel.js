var Cycle = require('@cycle/core');
var Rx = require('rx');

var _require = require('@cycle/dom');

var makeDOMDriver = _require.makeDOMDriver;
var div = _require.div;
var button = _require.button;
// main cycle loop

function main(_ref) {
  var DOM = _ref.DOM;

  var add$ = DOM.select('.add').events('click').map(function (ev) {
    return 1;
  });

  var sub$ = DOM.select('.sub').events('click').map(function (ev) {
    return -1;
  });

  var count$ = Rx.Observable.merge(add$, sub$).startWith(0).scan(function (total, change) {
    return total + change;
  });

  return {
    DOM: count$.map(function (count) {
      return div('.counter', ['Count: ' + count, button('.add', 'Add'), button('.sub', 'Sub')]);
    })
  };
}
Cycle.run(main, { DOM: makeDOMDriver('#app') });
