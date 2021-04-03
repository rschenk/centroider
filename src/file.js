const path = require('path')

function outputFile (inputFile, suffix) {
  const dir = path.dirname(inputFile)
  const ext = path.extname(inputFile)
  const base = path.basename(inputFile, ext)

  return path.format({
    dir: dir,
    base: `${base}--${suffix}${ext}`
  })
}

exports.outputFile = outputFile
