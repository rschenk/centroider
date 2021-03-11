const Paper = require('paper-jsdom')
const Calc = require('./src/calc.js')

const fs = require('fs')

const file = './test/fixtures/test_4.svg'

Paper.setup([100,100])

let svgFile = fs.readFileSync(file)

let imported = Paper.project.importSVG(svgFile.toString(), {insert: false})

// Paper.project.view.viewSize = imported.children[0].size

// console.log(Paper.project.view.viewSize)
