'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const esprima = require('esprima')

// const coverFilename = './scripts/coverage.json'
// const sourceName = 'app.js'
const coverFilename = './shake-example/coverage.json'
const sourceName = 'code.js'
const cover = require(coverFilename)

const sourceFilename = './shake-example/code.js'
const parsed = esprima.parse(fs.readFileSync(sourceFilename))
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
  console.log('function', fn.name, 'is covered?', f[k])
})


