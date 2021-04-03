const Paper = require('paper-jsdom')
const Calc = require('./calc.js')
const Units = require('./units.js')
const Styles = require('./styles.js')

const fs = require('fs')

const holeDiameter = Units.inch(0.056)
const holeRadius = holeDiameter / 2
const holePadding = holeDiameter

const padding = Units.inch(0.5)

function renderIterate(fileIn, fileOut, fileCallback) {
  let stylesheet = Styles.iterate
  let shapeSpec = parse(fileIn)
  
  shapeSpec.forEach((spec, i) => {
    let {name, shape, centroid, area, hangHoleDownPoint, hangHoleUpPoint} = spec 
    
    shape.style = stylesheet.shape
    
    let group = new Paper.Group({name: `${name}-container`})
    group.addChild(shape)
  
    let centroidMarker = new Paper.Shape.Circle({
      parent: group,
      name: `${name}-centroid`,
      center: centroid,
      radius: 2,
      style: stylesheet.centroid
    })
    
    let areaText = new Paper.PointText({
      parent: group,
      name: `${name}-area`,
      fontSize: 10,
      point: centroid.add([0, -5]),
      content: Math.round(area),
      style: stylesheet.text
    })
    
    let hangHoleDownPath = (i === 0) ? null : new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-down`,
      center: hangHoleDownPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
    
    let hangHoleDownPaddingPath = (i === 0) ? null : new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-down-pad`,
      center: hangHoleDownPoint,
      radius: holeRadius + holePadding,
      style: stylesheet.hangHolePadding
    })
  
    let hangHoleUpPath = new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-up`,
      center: hangHoleUpPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
  
    let hangHoleUpPaddingPath = new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-up-pad`,
      center: hangHoleUpPoint,
      radius: holeRadius + holePadding,
      style: stylesheet.hangHolePadding
    })
  
    spec.render = {
      group,
      centroidMarker,
      areaText,
      hangHoleUpPath,
      hangHoleDownPath,
      hangHoleUpPaddingPath,
      hangHoleDownPaddingPath,
    }
  })
  
  // Move all shapes back their initial positions
  shapeSpec.forEach(({render: {group}, initialPosition}) => group.position = initialPosition)
  
  shiftShapesIntoHangPosition(shapeSpec)
  
  drawLines(shapeSpec, stylesheet)
  
  // Reorganize!
  let shapesGroup = new Paper.Group({name: 'shapes'})
  let hangHoleGroup = new Paper.Group({name: 'hangHoles'})
  let metadataGroup = new Paper.Group({name: 'Metadata'})
  
  shapeSpec.forEach(({shape, render}) => {
    metadataGroup.addChild(render.group)
    shapesGroup.addChild(shape)
    hangHoleGroup.addChild(render.hangHoleDownPaddingPath)
  })
  
  // Resize canvas to fit all the pieces
  resizeCanvasToFit(Paper.project, Paper.project.activeLayer, padding)
  
  writeSVG(Paper.project, fileOut, fileCallback)
}

function renderDisplay(fileIn, fileOut, fileCallback) {
  let stylesheet = Styles.display
  let shapeSpec = parse(fileIn)
  
  shapeSpec.forEach((spec, i) => {
    let {name, shape, centroid, area, hangHoleDownPoint, hangHoleUpPoint} = spec 
    
    shape.style = stylesheet.shape
    
    let group = new Paper.Group({name: `${name}-container`})
    group.addChild(shape)
    
    let hangHoleDownPath = (i === 0) ? null : new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-down`,
      center: hangHoleDownPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
    
    let hangHoleUpPath = new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-up`,
      center: hangHoleUpPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
  
    spec.render = {
      group,
      hangHoleUpPath,
      hangHoleDownPath,
    }
  })
  
  // Move all shapes back their initial positions
  shapeSpec.forEach(({render: {group}, initialPosition}) => group.position = initialPosition)
  
  shiftShapesIntoHangPosition(shapeSpec)
  
  drawLines(shapeSpec, stylesheet)
  
  // Resize canvas to fit all the pieces
  resizeCanvasToFit(Paper.project, Paper.project.activeLayer, padding)
  
  writeSVG(Paper.project, fileOut, fileCallback)
}

function renderLaser(fileIn, fileOut, fileCallback) {
  let stylesheet = Styles.laser
  let shapeSpec = parse(fileIn)
  
  shapeSpec.forEach((spec, i) => {
    let {name, shape, centroid, area, hangHoleDownPoint, hangHoleUpPoint} = spec 
    
    shape.style = stylesheet.shape
    
    let group = new Paper.Group({name: `${name}-container`})
    group.addChild(shape)
    
    let hangHoleDownPath = (i === 0) ? null : new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-down`,
      center: hangHoleDownPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
    
    let hangHoleUpPath = new Paper.Path.Circle({
      parent: group,
      name: `${name}-hang-hole-up`,
      center: hangHoleUpPoint,
      radius: holeRadius,
      style: stylesheet.hangHole
    })
  
    spec.render = {
      group,
      hangHoleUpPath,
      hangHoleDownPath,
    }
  })
  
  // Rotate all shapes to minimum vertical height
  shapeSpec.forEach(({render}) => {
    let group = render.group
    group.applyMatrix = false

    let heights = new Array(180)
      .fill(null)
      .map((_, i) => i)
      .map(angle => {
        group.rotation = angle
        return {angle: angle, height: group.bounds.height}
      })
      .sort((a, b) => a.height - b.height)

    let minHeight = heights[0]

    group.applyMatrix = true
    group.rotation = minHeight.angle
  })
  
  // Line up all in a nice column
  shapeSpec.reverse().reduce(
    (y, {render: {group}}) => {
      group.bounds.topLeft = [0, y]
      return y + group.bounds.height + padding
    },
    0
  )
  
  // Resize canvas to fit all the pieces
  resizeCanvasToFit(Paper.project, Paper.project.activeLayer, padding)
  
  writeSVG(Paper.project, fileOut, fileCallback)
}

function resizeCanvasToFit(project, layer, padding) {
  project.view.viewSize = layer.bounds.size.add(padding * 2)
  layer.bounds.topLeft = [padding, padding]
}

function writeSVG(project, fileOut, callback) {
  fs.writeFile(
    fileOut, 
    project.exportSVG({asString: true, matchShapes: true}),
    callback
  )
}

function shiftShapesIntoHangPosition(shapeSpec) {
  // Leaving the top-most shape in place, horizontally shift  all lower ones to
  // line up how they would when hanging
  for(let i = shapeSpec.length - 1; i > 0; i--) {
    let shapeAbove = shapeSpec[i],
      shape = shapeSpec[i - 1],
      shapeAboveHangHoleAbs = shapeAbove.render.hangHoleDownPath.position,
      shapeHangHoleAbs = shape.render.hangHoleUpPath.position,
      d = shapeAboveHangHoleAbs.x - shapeHangHoleAbs.x
  
    shape.render.group.position = shape.render.group.position.add([d, 0])
  }
}

function drawLines(shapeSpec, stylesheet) {
  // Draw lines between the shapes
  shapeSpec.forEach((spec, i) => {
    let isTop = i === shapeSpec.length - 1
    
    let upHangHole = spec.render.hangHoleUpPath.position
    let downHangHole
    
    if (isTop) {
      downHangHole = [upHangHole.x, spec.render.group.bounds.topCenter.y]
    } else {
      downHangHole = shapeSpec[i+1].render.hangHoleDownPath.position
    }
      
    // Draw a line from hang hole above to hang hole below
    spec.render.string = new Paper.Path({
      parent: spec.render.group,
      name: `${spec.name}-string`,
      segments: [upHangHole, downHangHole],
      style: stylesheet.string
    })
  })
}

function parse(fileIn) {
  let {imported} = loadAndSetup(fileIn)
  
  let shapes = extractShapes(imported)
  let hangHolePoints = extractHangHolePoints(imported)
  let hangHolesByShape = mapHangHolesToShapes(shapes, hangHolePoints)
  
  let shapeSpec = analyse(shapes, hangHolesByShape)
  
  return shapeSpec
}



function mapHangHolesToShapes(shapes, hangHolePoints) {
  // Map associating a shape to any hang holes that might be inside
  let hangHolesByShape = shapes.reduce(
    (map, shape) => { map.set(shape, []); return map }, new Map()
  )
  
  // Loop through all hang holes and add to the first shape that contains them
  hangHolePoints.forEach(hangHolePoint => {
    let shape = shapes.find( shape => shape.contains(hangHolePoint) )
    shape && hangHolesByShape.get(shape).push(hangHolePoint)
  })
  
  // Reduce the array of all hang holes found in the shape, to the rightmost one
  hangHolesByShape.forEach((holePoints, shape) => {
    let rightmostPoint = holePoints.sort((a,b) => b.x - a.x)[0]
    hangHolesByShape.set(shape, rightmostPoint)
  })
  
  return hangHolesByShape
}

function analyse(shapes, hangHolesByShape) {
  let shapeSpecs = shapes.map((shape, i) => {
    return calcShape(shape, `shape-${i+1}`, hangHolesByShape.get(shape))
  })
  
  shapeSpecs
    .forEach(locateHangHoleDown)
  
  locateHangHoleUp(shapeSpecs)
  
  return shapeSpecs
}

function loadAndSetup(file) {
  // Give paper an initial, arbitrary size
  Paper.setup([100,100])

  // Load file from disc
  let svgFile = fs.readFileSync(file)

  // A bit confusing, but this resizes the Paper project to match the size of
  // the imported file
  let imported = Paper.project.importSVG(svgFile.toString(), {insert: false})
  Paper.project.view.viewSize = imported.children[0].size
  imported.bounds = imported.view.bounds

  return {project: Paper.project, imported}
}

function extractShapes(imported) {
  let shapeGroup = imported.children['shapes']
  
  if (!shapeGroup) {
    console.log('Error: Could not find a group with id "shapes" at the root level of SVG')
    process.exit()
  }
    
  let shapes = shapeGroup
    .children
    .filter(s => s.className == 'Path' || s.className == 'Shape')
    .sort((a, b) => b.bounds.center.y - a.bounds.center.y)
    .map(s => (s.className == 'Shape') ? s.toPath() : s ) // convert shapes to paths

  return shapes
}

function extractHangHolePoints(imported) {
  let hangHoleGroup = imported
    .children['hangHoles'] || { children: [] }

  let hangHoles = hangHoleGroup
    .children
    .filter(s => s.className == 'Path' || s.className == 'Shape')
    .map(h => h.bounds.center)

  return hangHoles
}



function calcShape(shape, name, hangHole) {
  let initialPosition = shape.position

  // Move shape to 0,0
  let delta = shape.bounds.topLeft.multiply(-1)
  shape.bounds.topLeft = [0, 0]
  let centroid = Calc.centroid(shape)
  let area = Calc.area(shape)
  let rightmostPoint = findRightmostPoint(shape)
  
  // Adjust hang hole to new position, if present
  let hangHoleDownPoint = hangHole && hangHole.add(delta)

  let clone = shape.clone()
  clone.name = name
  clone.style = Styles.shape

  return {shape: clone, centroid, area, initialPosition, name, rightmostPoint, hangHoleDownPoint}
}

function findRightmostPoint(shape) {
  let rightEdge = new Paper.Path({
    segments: [
      shape.bounds.topRight,
      shape.bounds.bottomRight
    ],
    insert: false
  })

  let intersections = rightEdge.getIntersections(shape)

  while(intersections.length < 1) {
    rightEdge.position = rightEdge.position.subtract([0.001, 0])
    intersections = rightEdge.getIntersections(shape)
  }

  let average = new Paper.Point({
    x: intersections[0].point.x,
    y: (intersections.map(cl => cl.point.y).reduce((acc, v) => acc + v) / intersections.length)
  })

  return average
}

function locateHangHoleDown(shapeSpec, i) {
  if(shapeSpec.hangHoleDownPoint) {
    return
  }
  
  if(i === 0) {
    shapeSpec.hangHoleDownPoint = shapeSpec.centroid
    return
  }

  let {shape, rightmostPoint, group, name} = shapeSpec

  let rightmostLocation = shape.getNearestLocation(rightmostPoint)

  let normal = shape
    .getNormalAt(rightmostLocation)
    .multiply(holeRadius + holePadding)

  if (!shape.contains(rightmostPoint.add(normal))) {
    normal = normal.multiply(-1)
  }

  let hangHoleDownPoint = locateHangHole(
      rightmostPoint,
      holeRadius + holePadding,
      shape,
      normal
    )
  shapeSpec.hangHoleDownPoint = hangHoleDownPoint
}

function locateHangHoleUp(shapeSpec) {
  let reducer = (accumulatedArea, spec) => {
    let {area, centroid, hangHoleDownPoint, shape, group, name} = spec

    // https://www.grc.nasa.gov/www/k-12/WindTunnel/Activities/balance_of_forces.html
    // 0 is defined at the centroid. Only need to take into account x
    // coordinates because gravity is always vertical, so we can project the
    // whole thing onto an x-axis line.
    let length = Math.abs(centroid.x - hangHoleDownPoint.x)
    let m0 = area
    let m1 = accumulatedArea
    let lBalance = (m1 * length) / (m0 + m1)
    let balancePoint = centroid.add([lBalance, 0])

    let plumbLine = new Paper.Path({
      segments: [
        shape.bounds.topLeft.add([balancePoint.x, -1]),
        shape.bounds.bottomLeft.add([balancePoint.x, 1])
      ],
      style: Styles.line,
      insert: false,
    })

    let topIntersection = plumbLine
      .getIntersections(shape)
      .sort((a, b) => a.point.y - b.point.y )[0]

    let hangHoleUpPoint = locateHangHole(
      topIntersection.point.add([0, holeRadius + holePadding]),
      holeRadius + holePadding,
      shape,
      new Paper.Point(0, 1)
    )

    spec.hangHoleUpPoint = hangHoleUpPoint

    return accumulatedArea + area
  }

  shapeSpec.reduce(reducer, 0)
}


function locateHangHole(startingPosition, distanceToEdge, shape, movementVector) {
  let position = startingPosition
  let dist = shape.getNearestPoint(position).getDistance(position)
  while (dist < distanceToEdge) {
    nudge = movementVector.normalize(Math.max(0.1, distanceToEdge - dist))
    position = position.add(nudge)
    dist = shape.getNearestPoint(position).getDistance(position)
  }
  return position
}


module.exports = {
  iterate: renderIterate,
  display: renderDisplay,
  laser: renderLaser
}