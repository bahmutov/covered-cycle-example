(function closure() {
  // need to get inside closures
  function add (a, b) {
    return a + b
  }
  function sub (a, b) {
    return a - b
  }
  console.log('2 + 3 =', add(2, 3))
}())
