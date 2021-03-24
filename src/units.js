let dpi = 72;

function inch(inches) {
  return inches * dpi;
}

function mm(mms) {
  return inch(mms / 25.4)
}

function px_to_inch(px) {
  return px / dpi;
}

exports.inch = inch
exports.mm = mm
exports.px_to_inch = px_to_inch
