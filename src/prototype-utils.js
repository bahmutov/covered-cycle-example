'use strict'

// Foo.prototype.foo = ...
function isPrototypePropertyAssignment (node) {
  return node.type === 'AssignmentExpression' &&
  node.left.type === 'MemberExpression' &&
  node.left.object.type === 'MemberExpression' &&
  node.left.object.property.name === 'prototype'
}

// Foo.prototype = ...
function isPrototypeAssignment (node) {
  // console.log('node.left')
  // console.log(node.left)
  return node.type === 'AssignmentExpression' &&
  node.left.type === 'MemberExpression' &&
  node.left.object.type === 'Identifier' &&
  node.left.property.name === 'prototype'
}

function prototypeOf (node) {
  // Foo.prototype = ... || Foo.prototype.foo = ...
  return node.left.object.name || node.left.object.object.name
}

module.exports = {
  isPrototypePropertyAssignment: isPrototypePropertyAssignment,
  isPrototypeAssignment: isPrototypeAssignment,
  prototypeOf: prototypeOf
}
