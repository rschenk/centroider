const { outputFile } = require('../src/file.js')

test('outputFile(path, suffix)', () => {
  const input = 'test/fixtures/abc.svg'
  const suffix = 'cranked'

  expect(outputFile(input, suffix)).toBe('test/fixtures/abc--cranked.svg')
})
