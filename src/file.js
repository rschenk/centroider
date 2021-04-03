const path = require('path')

function outputFile(inputFile, suffix) {
  let dir = path.dirname(inputFile),
      ext = path.extname(inputFile),
      base = path.basename(inputFile, ext)

  return path.format({
    dir: dir,
    base: `${base}--${suffix}${ext}`
  })
}

exports.outputFile = outputFile