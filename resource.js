const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')

const inputFilename = './dist/app-covered.js'
const outputFilename = './dist/app-covered.min.js'

const source = fs.readFileSync(inputFilename, 'utf8')
const parsed = esprima.parse(source)
const codeOptions = {
  format: {
    semicolons: false,
    compact: true
  }
}
const output = escodegen.generate(parsed, codeOptions)
fs.writeFileSync(outputFilename, output, 'utf8')
console.log(inputFilename, '->', outputFilename)
