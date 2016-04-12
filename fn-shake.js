'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')

// do not remove some functions for now
function shouldKeep (fnNode) {
  la(is.object(fnNode), 'not function node', fnNode)
  if (!fnNode.id) {
    return
  }
  la(is.unemptyString(fnNode.id.name), 'missing function name', fnNode)
  const keepFunctions = [
    'Item', 'noop', 'SoftSetHook', 'EvStore', 'EvHook', 'SVGAttributeNamespace',
    'AttributeHook', 'svg', 'updateWidget', 'escapeHtml', 'extend', 'createAttribute',
    'toHTML', 'makeBogusSelect', 'makeHTMLDriver', 'mockDOMSource',
    'defaultOnErrorFn', 'isolateSource', 'isolateSink', 'ascending'
  ]
  return is.oneOf(keepFunctions, fnNode.id.name)
}

const coverFilename = './scripts/coverage.json'
la(fs.existsSync(coverFilename), 'missing coverage file', coverFilename)
const cover = require(coverFilename)
const sourceName = 'app.js'
// const coverFilename = './shake-example/coverage.json'
// const sourceName = 'code.js'

const sourceFilename = './dist/app.js'
la(fs.existsSync(sourceFilename), 'missing source file', sourceFilename)
const parseOptions = {
  loc: true,
  range: true
}
const source = fs.readFileSync(sourceFilename, 'utf8')
const parsed = esprima.parse(source, parseOptions)
console.log('parsed', sourceFilename)
// console.log(parsed)

la(is.has(cover, sourceName), 'missing coverage for', sourceName, 'in', coverFilename)
const scriptCover = cover[sourceName]
la(is.unemptyString(scriptCover.path), 'missing path')
console.log('shaking functions in', scriptCover.path)

const f = scriptCover.f
la(is.object(f), 'missing function coverage object')
const fnMap = scriptCover.fnMap
la(is.object(fnMap), 'missing function map')
console.log('has coverage information about', Object.keys(fnMap).length, 'functions')
// Object.keys(fnMap).forEach((k) => {
//   const fn = fnMap[k]
//   console.log('function', fn.name, fn, 'is covered?', f[k])
// })

var removed = 0

function findCoveredFunction(line, column) {
  la(is.number(line) && is.number(column),
    'missing function start line or column', line, column)
  var found
  Object.keys(fnMap).some((k) => {
    const fn = fnMap[k]
    if (fn.loc.start.line === line &&
      fn.loc.start.column === column) {
      found = {
        fn: fn,
        covered: f[k]
      }
      return true
    }
  })
  return found
}

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

function blank (text, from, to) {
  la(is.unemptyString(text), 'missing text', text)
  la(is.number(from), 'missing from index', from)
  la(is.number(to), 'missing to index', to)
  la(to >= from, 'invalid from and to', from, to)

  var k
  for (k = from; k < to; k += 1) {
    text = setCharAt(text, k, ' ')
  }
  return text
}

var sourceBlanked = source
function walk(node, index, list) {
  // console.log(node.type)
  if (node.type === 'FunctionDeclaration') {
    // console.log(node.id.name)
    const line = node.loc.start.line
    const column = node.loc.start.column
    // console.log('function "%s" starts at line %d column %d', node.id.name, line, column)
    const info = findCoveredFunction(line, column)
    if (info && !info.covered) {
      if (!shouldKeep(node)) {
        console.log('function "%s" is not covered, removing', node.id.name)
        list.splice(index, 1)
        removed += 1
      }
    }
  }
  if (node.type === 'FunctionExpression') {
    // console.log(node.id.name)
    const line = node.loc.start.line
    const column = node.loc.start.column
    // console.log('function expressions "%s" starts at line %d column %d', node.id.name, line, column)
    const info = findCoveredFunction(line, column)
    if (info && !info.covered) {
      if (!shouldKeep(node)) {
        console.log('function expression "%s" is not covered, removing',
          (node.id ? node.id.name : 'unnamed'))
        if (Array.isArray(list)) {
          list.splice(index, 1)
        } else {
          console.log('cannot remove - no parent list')
        }
        removed += 1
      }
    }
  }

  if (Array.isArray(node.body)) {
    node.body.forEach(walk)
  }
  if (is.object(node.body)) {
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
const outputFilename = './dist/app-covered.js'
fs.writeFileSync(outputFilename, output, 'utf8')
console.log('removed %d unused functions', removed)
console.log('output code with uncovered functions removed saved to', outputFilename)
