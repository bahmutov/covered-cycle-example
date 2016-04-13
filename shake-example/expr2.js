;(function closure () {
  var b
  var p = {}
  // var o = b = (function outer(out) {
  //   out.prototype.add = function add(a, b) {
  //     return a + b
  //   }
  // }(p))

  var k = 'k' || function sub (a, b) {
    return a - b
  }

  console.log('something else')

  ;(function foo () {
    console.log('inside function foo')
    return function nothing () {
      console.log('inside function nothing')
    }
  }).call(this)
}())
