const Paper = require('paper-jsdom')
const Calc = require('./calc.js')

const fs = require('fs')

const file = './test_4.svg'

Paper.setup([100,100])

let svgFile = fs.readFileSync(file)

let imported = Paper.project.importSVG(svgFile.toString())
Paper.project.view.viewSize = imported.children[0].size
imported.bounds = imported.view.bounds

let shapesContainer = imported.children['shapes']

let centroidGroup = new Paper.Group({name: 'centroids'})
let areaGroup = new Paper.Group({name: 'areas'})
imported.addChild(centroidGroup)
imported.addChild(areaGroup)

shapesContainer.children.forEach((shape, i) => {
  let centroidPoint = Calc.centroid(shape)
  let area = Calc.area(shape)

  let centroid = new Paper.Shape.Circle({
    center: centroidPoint,
    radius: 2,
    strokeColor: '#f00',
    fillColor: null
  })
  centroidGroup.addChild(centroid)

  let areaText = new Paper.PointText({
    fontSize: 10,
    point: centroidPoint.add([0, -10]),
    content: Math.round(area),
    fillColor: '#000',
    strokeColor: null,
    fontFamily: 'Avenir Next',
    justification: 'center'
  })

  areaGroup.addChild(areaText)
})

console.log(Paper.project.exportSVG({asString: true, matchShapes: true}))
