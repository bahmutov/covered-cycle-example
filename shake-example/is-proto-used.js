'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')
const protoUtils = require('../src/prototype-utils')

const sourceFilename = './proto.js'
la(fs.existsSync(sourceFilename), 'missing source file', sourceFilename)
const parseOptions = {
  loc: true,
  range: true
}
const source = fs.readFileSync(sourceFilename, 'utf8')
const parsed = esprima.parse(source, parseOptions)
console.log('parsed', sourceFilename)

function walk (node, index, list) {
  // console.log(node.type)
  if (node.type === 'AssignmentExpression') {
    if (protoUtils.isPrototypePropertyAssignment(node) || protoUtils.isPrototypeAssignment(node)) {
      console.log('assignment to prototype of', protoUtils.prototypeOf(node),
        'at line', node.loc.start.line)
    }
  }
  if (node.type === 'FunctionDeclaration') {
    console.log(node.type, node.id.name)
    const line = node.loc.start.line
    const column = node.loc.start.column
  }
  if (node.type === 'FunctionExpression') {
    console.log(node.type, node.id ? node.id.name : 'no name')
    const line = node.loc.start.line
    const column = node.loc.start.column
  // console.log('function expressions "%s" starts at line %d column %d', node.id.name, line, column)
  }

  if (Array.isArray(node.body)) {
    node.body.forEach(walk)
  }
  if (is.object(node.body)) {
    walk(node.body)
  }
  if (is.object(node.object)) {
    walk(node.object)
  }
  if (is.object(node.argument)) {
    walk(node.argument)
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
  if (is.object(node.callee)) {
    walk(node.callee)
  }
  if (node.callee && node.callee.body) {
    walk(node.callee.body)
  }
  if (Array.isArray(node.arguments)) {
    node.arguments.forEach(walk)
  }
  if (Array.isArray(node.elements)) {
    node.elements.forEach(walk)
  }
  if (Array.isArray(node.declarations)) {
    node.declarations.forEach(walk)
  }
  if (node.init) {
    walk(node.init)
  }
}
walk(parsed)

const codeOptions = {
  format: {
    indent: {
      style: '  '
    },
    semicolons: false
  }
}
const output = escodegen.generate(parsed, codeOptions)
console.log(output)
// const outputFilename = './dist/app-covered.js'
// fs.writeFileSync(outputFilename, output, 'utf8')
// console.log('output code with uncovered functions removed saved to', outputFilename)
