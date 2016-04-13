// v8 likes predictible objects
function Item (fun, array) {
  this.fun = fun
  this.array = array
}
Item.prototype.run = function () {
  this.fun.apply(null, this.array)
}
function Foo () {
  // not used
}
Foo.prototype.foo = function foo () {
  return foo
}
console.log('foo and its prototype never used')
// is Foo.prototype used anywhere?

// part of RxJS
var EmptyError = Rx.EmptyError = function () {
  this.message = 'Sequence contains no elements.'
  Error.call(this)
}
EmptyError.prototype = Object.create(Error.prototype)
EmptyError.prototype.name = 'EmptyError'
