#!/usr/bin/env node

import { Command, CommanderError } from 'commander';
import { checkMemory } from '../lib/check-memory.js';
import { testPg } from '../lib/test-pg.js';
import { cmdCrlf, rand, randInt } from '../lib/ngt.js';
import {
  cmdParseFloat,
  cmdParseInteger,
  readEnvFileToJson,
} from '../lib/utils.js';
import { testMysql } from '../lib/test-mysql.js';
import { dsed } from '../lib/dsed.js';
import { LogAnalysis3 } from '../log-analysis/log-analysis3.js';

const program = new Command();
import fs from 'fs';

program
  .name('node-global-tool')
  .description('Tools developed using Node which is for CLI use.')
  .version('1.1.5');

program
  .command('tt')
  .argument('[p1]', 'p1')
  .action((p1: string = '') => {
    console.log(`test p1=${p1}`);
    LogAnalysis3.test();
    // console.log(`tt; envFile=${envFile}`);
    // const config = readEnvFileToJson(envFile);
    // console.log(`config`, config);
  });

program
  .command('log-analysis')
  .argument(
    '[config_file_path]',
    'config_file_path, default logana.json',
    'logana.json'
  )
  .action(async (configFilePath: string) => {
    console.log(`log-analysis configFilePath=${configFilePath}`);
    const instance = new LogAnalysis3();
    await instance.exec(configFilePath);
    // console.log(`tt; envFile=${envFile}`);
    // const config = readEnvFileToJson(envFile);
    // console.log(`config`, config);
  });

program
  .command('dsed')
  .argument('<search_path>', 'search_path')
  .argument('[config_file]', 'config_file in tsv, default dsed.tsv', 'dsed.tsv')
  .action((searchPath, configFilePath) => {
    console.log(
      `dsed; searchPath=${searchPath}, configFilePath=${configFilePath}`
    );
    dsed(searchPath, configFilePath);
    // const config = readEnvFileToJson(envFile);
    // console.log(`config`, config);
  });

program
  .command('check-memory')
  .description('Check memory of heapStatistics')
  .action(() => {
    // console.log(`check-memory`);
    checkMemory();
  });

program
  .command('test-pg')
  .argument('<postgres_url>', 'postgres_url')
  .description('Test postgresql connection string. Server must use SSL.')
  .action((postgresUrl) => {
    // console.log(`test-pg`);
    testPg(postgresUrl);
  });

program
  .command('test-mysql')
  .argument('<mysql_url>', 'mysql_url')
  .description(
    'Test MySQL connection string. Server must use SSL. EG mysql://derek:xxxxxx@localhost/db1'
  )
  .action(async (mysqlUrl) => {
    // console.log(`test-mysql`);
    await testMysql(mysqlUrl);
  });

program
  .command('now')
  .description('Show current date and time')
  .action(() => {
    console.log('now ' + new Date());
  });

program
  .command('rand')
  .argument('[minValue]', 'min value', cmdParseFloat, 0)
  .argument('[maxValue]', 'max value', cmdParseFloat, 100)
  .description('Random float number')
  .action((minValue, maxValue) => {
    // console.log(`rand minValue=${minValue}, maxValue=${maxValue}`);
    rand(minValue, maxValue);
  });

program
  .command('rand-int')
  .argument('[minValue]', 'min value', cmdParseInteger, 0)
  .argument('[maxValue]', 'max value', cmdParseInteger, 100)
  .description('Random integer number')
  .action((minValue, maxValue) => {
    // console.log(`rand-int minValue=${minValue}, maxValue=${maxValue}`);
    randInt(minValue, maxValue);
  });

program
  .command('crlf')
  .argument('<filepath>', 'File path')
  .argument('[target]', 'Target format, lf/cr/crlf')
  .description('Check CRLF of a file')
  .action((filepath, target) => {
    console.log(`crlf filepath=${filepath}, target=${target}`);
    cmdCrlf(filepath, target);
  });
// program.arguments('<command>').action(() => {
//   program.outputHelp();
//   console.log('\nExamples:');
//   console.log('  $ bin1 now - Show current date and time');
//   console.log('  $ bin1 check-memory - Check memory');
//   console.log(
//     '  $ bin1 test-pg POSTGRESQL - Test PostgreSQL connection string'
//   );
//   console.log('  $ bin1 crlf - Check if file is CRLF/CR/LF');
//   console.log('  $ bin1 crlf:setlf - Set file to LF');
//   console.log('  $ bin1 crlf:setcr - Set file to CR');
//   console.log('  $ bin1 crlf:setcrlf - Set file to CRLF');
// });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(`no param`);
}
