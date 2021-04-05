const expect = require('expect.js')
const { outputFile } = require('../src/file.js')

describe('file', () => {
  describe('outputFile(path, suffix)', () => {
    it('makes the right path', () => {
      const input = 'test/fixtures/abc.svg'
      const suffix = 'cranked'

      expect(outputFile(input, suffix)).to.be('test/fixtures/abc--cranked.svg')
    })
  })
})
