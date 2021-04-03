const dpi = 72

function inch (inches) {
  return inches * dpi
}

function mm (mms) {
  return inch(mms / 25.4)
}

function pxToInch (px) {
  return px / dpi
}

exports.inch = inch
exports.mm = mm
exports.pxToInch = pxToInch
