'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')

const sourceFilename = './packed-app.js'
la(fs.existsSync(sourceFilename), 'missing source file', sourceFilename)
const parseOptions = {
  loc: true,
  range: true
}
const source = fs.readFileSync(sourceFilename, 'utf8')
const parsed = esprima.parse(source, parseOptions)
console.log('parsed', sourceFilename)
// console.log(parsed)

function walk (node, parent, index) {
  console.log(node.type)
  // if (node.type === 'ExpressionStatement') {
  //   console.log(node)
  // }
  // if (node.type === 'CallExpression') {
  //   console.log(node)
  // }
  // if (node.type === 'ArrayExpression') {
  //   console.log(node)
  // }
  if (node.type === 'FunctionDeclaration') {
    console.log(node.id.name)
    console.log(node)
    const line = node.loc.start.line
    const column = node.loc.start.column
    console.log('function "%s" starts at line %d column %d', node.id.name, line, column)
  }
  if (Array.isArray(node.body)) {
    node.body.forEach((child, k) => walk(child, node, k))
  }
  if (is.object(node.body)) {
    console.log('node.body is an object')
    walk(node.body)
  }
  if (is.object(node.expression)) {
    walk(node.expression)
  }
  if (node.left) {
    walk(node.left)
  }
  if (node.right) {
    walk(node.right)
  }
  if (node.callee && node.callee.body) {
    walk(node.callee.body)
  }
  if (Array.isArray(node.arguments)) {
    node.arguments.forEach((child, k) => walk(child, node, k))
  }
  if (Array.isArray(node.elements)) {
    node.elements.forEach((child, k) => walk(child, node, k))
  }
}
walk(parsed)

// const codeOptions = {
//   format: {
//     indent: {
//       style: '  '
//     },
//     semicolons: false
//   }
// }
// const output = escodegen.generate(parsed, codeOptions)
// console.log('removed unused functions')
// console.log(output)
