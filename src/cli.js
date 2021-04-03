#!/usr/bin/env node
const { outputFile } = require('./file.js')
const argv = require('yargs/yargs')(process.argv.slice(2))
  .command('balance [options] <file>', 'Balance a mobile', {
    iterate: {
      alias: 'i',
      describe: 'Output optimized for running over and over to tweak the design',
      boolean: true,
      conflicts: ['l', 'd']
    },
    laser: {
      alias: 'l',
      describe: 'Output optimized for laser cutting',
      boolean: true,
      conflicts: ['i', 'd']
    },
    display: {
      alias: 'd',
      describe: 'Pretty output for display',
      boolean: true,
      conflicts: ['l', 'i']
    }
  })
  .command('annotate <file>', 'Annotate SVG shapes with centroid, area')
  .demandCommand(2)
  .help('h')
  .alias('h', 'help')
  .argv

if (argv._[0] === 'annotate') {
  console.log('TODO annotate mode is not done yet')
}

if (argv._[0] === 'balance') {
  console.log('Balancing...')
  const balancer = require('./balancer.js')

  let renderer = balancer.display
  let fileSuffix = 'display'

  if (argv.iterate) {
    renderer = balancer.iterate
    fileSuffix = 'iterate'
  } else if (argv.laser) {
    renderer = balancer.laser
    fileSuffix = 'laser'
  }

  const fileIn = argv.file
  const fileOut = outputFile(argv.file, `balanced-${fileSuffix}`)

  renderer(fileIn, fileOut, () => console.log(`Balanced ${fileOut}`))
}
