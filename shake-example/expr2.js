(function closure() {
  var b
  var p = {}
  var o = b = (function outer(out) {
    out.prototype.add = function add(a, b) {
      return a + b
    }
  }(p))
}())
