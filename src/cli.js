#!/usr/bin/env node
const File = require('./file.js')
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
    .argv;

if (argv._[0] === 'annotate') {
  console.log('TODO annotate mode is not done yet')
}

if (argv._[0] === 'balance') {
  console.log("balancing!")
}

File.outputFile(argv.file)

console.dir(argv)