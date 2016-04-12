const Cycle = require('@cycle/core')
const Rx = require('rx')
const {makeDOMDriver, div, button} = require('@cycle/dom')
// main cycle loop
function main ({DOM}) {
  const add$ = DOM
    .select('.add')
    .events('click')
    .map((ev) => 1)

  const sub$ = DOM
    .select('.sub')
    .events('click')
    .map((ev) => -1)

  const count$ = Rx.Observable.merge(add$, sub$)
    .startWith(0)
    .scan((total, change) => total + change)

  return {
    DOM: count$.map((count) => div('.counter', [
      'Count: ' + count,
      button('.add', 'Add'),
      button('.sub', 'Sub')
    ])
    )
  }
}
Cycle.run(main, { DOM: makeDOMDriver('#app') })
