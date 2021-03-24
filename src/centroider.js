const Paper = require('paper-jsdom')
const Calc = require('./calc.js')
const Units = require('./units.js')
const Styles = require('./styles.js')

const fs = require('fs')

const fileIn = './test/fixtures/input.svg'
const fileOut = './test/fixtures/input--centroided.svg'

const holeDiameter = Units.inch(0.056)
const holeRadius = holeDiameter / 2
const holePadding = holeDiameter

let {imported} = loadAndSetup(fileIn)

let shapes = extractShapes(imported)

let shapeSpec = analyse(shapes)

// Render

shapeSpec.forEach((spec, i) => {
  let {name, shape, centroid, area, hangHoleDownPoint, hangHoleUpPoint} = spec 
  
  let group = new Paper.Group({name: `${name}-container`})
  group.addChild(shape)

  let centroidMarker = new Paper.Shape.Circle({
    parent: group,
    name: `${name}-centroid`,
    center: centroid,
    radius: 2,
    strokeColor: '#f00',
    fillColor: null
  })
  
  let areaText = new Paper.PointText({
    parent: group,
    name: `${name}-area`,
    fontSize: 10,
    point: centroid.add([0, -10]),
    content: Math.round(area),
    fillColor: '#000',
    strokeColor: null,
    fontFamily: 'Avenir Next',
    justification: 'center'
  })
  
  
  let hangHoleDownPath = (i === 0) ? null : new Paper.Path.Circle({
    parent: group,
    name: `${name}-hang-hole-down`,
    center: hangHoleDownPoint,
    radius: holeRadius,
    style: Styles.hole
  })
  
  // let hangHoleDownPaddingPath = new Paper.Path.Circle({
    //   parent: group,
    //   name: `${name}-hang-hole-down-pad`,
    //   center: hangHoleDownPoint,
    //   radius: holeRadius + holePadding,
    //   style: Styles.line
    // })
    
  let hangHoleUpPath = new Paper.Path.Circle({
    parent: group,
    name: `${name}-hang-hole-up`,
    center: hangHoleUpPoint,
    radius: holeRadius,
    style: Styles.hole
  })

  // let hangHoleUpPaddingPath = new Paper.Path.Circle({
  //   parent: group,
  //   name: `${name}-hang-hole-up-pad`,
  //   center: hangHoleUpPoint,
  //   radius: holeRadius + holePadding,
  //   style: Styles.line
  // })
  
  spec.render = {
    group,
    centroidMarker,
    areaText,
    hangHoleUpPath,
    hangHoleDownPath,
  }
})

let piecesGroup = new Paper.Group({name: 'Pieces'})
let stringGroup = new Paper.Group({name: 'Strings'})
let metadataGroup = new Paper.Group({name: 'Metadata'})


// Move all shapes back their initial positions
shapeSpec.forEach(({render: {group}, initialPosition}) => group.position = initialPosition)

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
    style: Styles.string
  })
})

// Reorganize!
shapeSpec.forEach(({render}) => {
  piecesGroup.addChild(render.group)
  stringGroup.addChild(render.string)
  metadataGroup.addChild(render.areaText)
  metadataGroup.addChild(render.centroidMarker)
})

fs.writeFile(
  fileOut, 
  Paper.project.exportSVG({asString: true, matchShapes: true}),
  () => console.log(`Wrote ${fileOut}`)
)

function analyse(shapes) {
  let shapeSpec = shapes.map((shape, i) => calcShape(shape, `shape-${i+1}`))
  
  shapeSpec
    .forEach(addHangHoleDown)
  
  addHangHoleUp(shapeSpec)
  
  return shapeSpec
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
  let shapes = imported
    .children['shapes']
    .children
    .filter(s => s.className == 'Path')
    .sort((a, b) => b.bounds.center.y - a.bounds.center.y)

  return shapes
}


function calcShape(shape, name) {
  let initialPosition = shape.position

  // Move shape to 0,0
  shape.bounds.topLeft = [0, 0]
  let centroid = Calc.centroid(shape)
  let area = Calc.area(shape)
  let rightmostPoint = findRightmostPoint(shape)

  let clone = shape.clone()
  clone.name = name
  clone.style = Styles.shape

  return {shape: clone, centroid, area, initialPosition, name, rightmostPoint}
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

function addHangHoleDown(shapeSpec, i) {
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

function addHangHoleUp(shapeSpec) {

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
    let balancePointX = centroid.add([lBalance, 0]).x

    let plumbLine = new Paper.Path({
      segments: [
        shape.bounds.topLeft.add([balancePointX, -1]),
        shape.bounds.bottomLeft.add([balancePointX, 1])
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
