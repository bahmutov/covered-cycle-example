'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')

// const coverFilename = './scripts/coverage.json'
// const sourceName = 'app.js'
const coverFilename = './shake-example/coverage.json'
const sourceName = 'code.js'
const cover = require(coverFilename)

const sourceFilename = './shake-example/code.js'
const parseOptions = {
  loc: true,
  range: true
}
const source = fs.readFileSync(sourceFilename, 'utf8')
const parsed = esprima.parse(source, parseOptions)
console.log('parsed', sourceFilename)
console.log(parsed)

la(is.has(cover, sourceName), 'missing coverage for', sourceName, 'in', coverFilename)
const scriptCover = cover[sourceName]
la(is.unemptyString(scriptCover.path), 'missing path')
console.log('shaking functions in', scriptCover.path)

const f = scriptCover.f
la(is.object(f), 'missing function coverage object')
const fnMap = scriptCover.fnMap
la(is.object(fnMap), 'missing function map')
console.log('has coverage information about', Object.keys(fnMap).length, 'functions')
Object.keys(fnMap).forEach((k) => {
  const fn = fnMap[k]
  console.log('function', fn.name, fn, 'is covered?', f[k])
})

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
function walk(node, parent, index) {
  console.log(node.type)
  if (node.type === 'FunctionDeclaration') {
    console.log(node.id.name, 'at', node.loc, node.range)
    const info = findCoveredFunction(node.loc.start.line, node.loc.start.column)
    if (info && !info.covered) {
      console.log('removing function', node.id.name, 'from source')
      // sourceBlanked = blank(sourceBlanked, Number(node.range[0]), Number(node.range[1]))
      // console.log(parent)
      parent.body.splice(index, 1)
    }
  }
  if (Array.isArray(node.body)) {
    node.body.forEach((child, k) => walk(child, node, k))
  }
}
walk(parsed)

console.log('removed uncovered functions')
console.log(sourceBlanked)

const output = escodegen.generate(parsed)
console.log('generated')
console.log(output)
