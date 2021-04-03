const Paper = require('paper-jsdom')
const D3Polygon = require('d3-polygon')

/*
 * Computes the centroid of the shape
 * @param {Paper.Path} paperShape - the shape as described by a PaperJs Path
 * @returns {Paper.Point} the coordinates of the centroid
 */
function centroid (paperShape) {
  const copy = paperShape.clone({ insert: false })

  copy.flatten()

  const polyline = copy
    .segments
    .map(s => [s.point.x, s.point.y])

  return new Paper.Point(D3Polygon.polygonCentroid(polyline))
}

/*
 * Computes the area of the shape
 * @param {Paper.Path} paperShape - the shape as described by a PaperJs Path
 * @returns {number} the area
 */
function area (paperShape) {
  return Math.abs(paperShape.area)
}

exports.centroid = centroid
exports.area = area
