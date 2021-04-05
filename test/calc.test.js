const expect = require('expect.js')
const { area, centroid, Paper } = require('../src/calc.js')

describe('calc', () => {
  before(() => { Paper.setup([100, 100]) })

  describe('centroid', () => {
    it('returns the centroid of the given Paper path', () => {
      const rect = new Paper.Path.Rectangle([0, 0], [2, 2])

      expect(centroid(rect)).to.eql(new Paper.Point(1, 1))
    })
  })

  describe('area', () => {
    it('returns the area of a Paper path', () => {
      const rect = new Paper.Path.Rectangle([0, 0], [2, 2])

      expect(area(rect)).to.be(4)
    })
  })
})
