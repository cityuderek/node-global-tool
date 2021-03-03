#!/usr/bin/env node

const yargs = require('yargs');
const ngt = require("../lib/ngt");

const argv = yargs
  .demand(1)
  // .options({
  //   file: {
  //     alias: 'f',
  //     default: null,
  //     description: 'Input file',
  //     type: 'string',
  //   },
  // })
  // .options({
  //   folder: {
  //     alias: 'F',
  //     default: null,
  //     description: 'Input folder',
  //     type: 'string',
  //   },
  // })
  .example(
    'ngt now',
    'Show current date and time',
  )
  .example(
    'ngt crlf', 'Check file if it is CRLF/CR/LF',
  )
  .example(
    'ngt crlf:setlf', 'Set file as LF',
  )
  .example(
    'ngt crlf:setcr', 'Set file as CR',
  )
  .example(
    'ngt crlf:setcrlf', 'Set file as CRLF',
  )
  // .example(
  //   'ngt crlf:rm',
  //   'Remove file if it contains CRLF',
  // )
  // .example(
  //   'ngt splitLog',
  //   'Split Log file',
  // )
  .argv;

// console.log('argv', argv);
const options = {
  file: argv.file,
  folder: argv.folder,
}
ngt.execCmd(argv._, options);