const Paper = require('paper-jsdom')
const Calc = require('./calc.js')

const fs = require('fs')

const file = './test/fixtures/test_4.svg'

Paper.setup([100,100])

let svgFile = fs.readFileSync(file)

let imported = Paper.project.importSVG(svgFile.toString(), {insert: false})
Paper.project.view.viewSize = imported.children[0].size
imported.bounds = imported.view.bounds

let shapes = imported
  .children['shapes']
  .children
  .filter(s => s.className == 'Path')
  .sort((a, b) => b.bounds.center.y - a.bounds.center.y)

let shapeSpec = shapes.map((shape, i) => {
  let name = `shape-${i+1}`
  let group = new Paper.Group({name: `${name}-container`})
  let centroid = Calc.centroid(shape)
  let area = Calc.area(shape)

  let clone = shape.clone()
  clone.name = name
  group.addChild(clone)

  let centroidMarker = new Paper.Shape.Circle({
    name: `${name}-centroid`,
    center: centroid,
    radius: 2,
    strokeColor: '#f00',
    fillColor: null
  })
  group.addChild(centroidMarker)

  let areaText = new Paper.PointText({
    name: `${name}-area`,
    fontSize: 10,
    point: centroid.add([0, -10]),
    content: Math.round(area),
    fillColor: '#000',
    strokeColor: null,
    fontFamily: 'Avenir Next',
    justification: 'center'
  })

  group.addChild(areaText)

  return {group, centroid, area}
})

console.log(Paper.project.exportSVG({asString: true, matchShapes: true}))
