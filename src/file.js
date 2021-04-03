const FS = require('fs')
const Path = require('path')

function outputFile(inputFile) {
  console.log(`>>>>> ${inputFile}`)
}

exports.outputFile = outputFile