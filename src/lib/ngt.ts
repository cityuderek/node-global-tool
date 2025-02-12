import * as _ from 'lodash';
import * as crlf from 'crlf';
import { split } from './utils.js';

// const { nfa, fileUtil } = require('node-fa/util');

export const rand = (minValue: number, maxValue: number): void => {
  const val = Math.random() * (maxValue - minValue) + minValue;
  console.log(`rand, ${minValue} <= value < ${maxValue}`);
  console.log(val);
};

export const randInt = (minValue: number, maxValue: number): void => {
  const val = Math.floor(Math.random() * (maxValue - minValue) + minValue);
  console.log(`rand, ${minValue} <= value < ${maxValue}`);
  console.log(val);
};

export const cmdCrlf = (filepath: string, target: string): void => {
  if (target === 'lf') {
    crlf.set(filepath, 'LF', function (err: any, ending: any) {
      console.log(`file=${filepath} set to LF`);
    });
    ////
  } else if (target === 'cr') {
    crlf.set(filepath, 'CR', function (err: any, ending: any) {
      console.log(`file=${filepath}, set to CR`);
    });
    ////
  } else if (target === 'crlf') {
    crlf.set(filepath, 'CRLF', function (err: any, ending: any) {
      console.log(`file=${filepath} set to CRLF`);
    });
    ////
  } else {
    crlf.get(filepath, null, function (err: any, ending: any) {
      console.log(`file=${filepath}, detected format: ${ending}`);
    });
    ////
    // console.log(`Incorect format, ${target}`);
  }
};
