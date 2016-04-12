function Foo() {
  // not used
}
Foo.prototype.foo = function foo() {
  return foo
}
console.log('foo and its prototype never used')
// is Foo.prototype used anywhere?

