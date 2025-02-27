// const config = require('./config');
// const fs = require('fs');
// const CounterHelper = require('../helpers/counterHelper');

import { getFileName, readFileSyncJson } from '../lib/file-utils.js';
import CounterHelper from '../helpers/counter-helper.js';
import { createReadStream, writeFileSync, appendFileSync } from 'fs';
import { createInterface } from 'readline';
import { TimeUseHelper } from '../lib/time-use-helper.js';
import { countOccurrences } from '../lib/utils.js';

type PatternConfig =
  | string
  | {
      name: string;
      pattern?: string;
      depends?: string;
      preTest?: string;
      regStr?: string;
      default?: string;
      valueMap?: { [key in string]: number };
      op?: '<=';
    };

type LogAnalysisConfig = {
  action: string;
  files: string[];
  patterns: PatternConfig[];
  startPattern?: string;
  endPattern?: string;
};

type PatternObject = {
  type: 'string' | 'regex' | 'regex_fn';
  name: string;
  pattern: RegExp | string;
  depends?: string;
  preTest?: string;
  op?: '<=';
  default?: string;
  // values?: [{ [key in string]: number }];
  valueMap?: { [key in string]: number };
};

type AnaCountTask = {
  patternObjects: PatternObject[];
  startPattern: string;
  endPattern: string;
};

type AnaCountResult = {
  lineCnt: number;
  anaLineCnt: number;
  patterns: string[];
  counterHelper: CounterHelper;
};

type CombinedResult = {
  header: string;
  lines: string[];
};

export class LogAnalysis3 {
  filepaths: string[] = [];
  task: AnaCountTask = {
    patternObjects: [],
    startPattern: '',
    endPattern: '',
  };

  static async test() {
    // const configPath = 'logana.json';
    console.log('LogAnalysis3.test');
    // console.log('config', config);
    const instance = new LogAnalysis3();
    await instance.exec();
  }

  async exec(configPath: string = 'logana.json'): Promise<void> {
    this.loadConfig(configPath);
    await this.runTasks();
  }

  async runTasks() {
    const task = this.task;
    console.log(
      `Task; patterns=${
        task.patternObjects ? task.patternObjects.length : 0
      }, startPattern=${task.startPattern}, endPattern=${task.endPattern}`
    );
    console.time('runTasks');
    this.clearResultFile();
    let combinedResult = null;
    for (const filepath of this.filepaths) {
      console.time('runTask');
      const result = await this.anaCount(this.task, filepath);
      console.timeEnd('runTask');
      this.showResult(this.task, filepath, result);
      // this.saveResult(this.task, filepath, result);
      combinedResult = this.addResultToCombinedResult(
        this.task,
        filepath,
        result,
        combinedResult
      );
    }
    this.saveCombinedResult(combinedResult as CombinedResult);
    console.timeEnd('runTasks');
    // TimeUseHelper.show();
  }

  async anaCount(
    task: AnaCountTask,
    filepath: string
  ): Promise<AnaCountResult> {
    const result: AnaCountResult = newAnaCountResult(task);
    const patternObjects = task.patternObjects;
    const startPattern = task?.startPattern;
    const endPattern = task?.endPattern;
    let skipCount = 0;
    let checkCount = 0;

    // console.log(`filepath=${filepath}`);
    // console.log(
    //   `filepath=${filepath}, patterns=${
    //     patternObjects ? patternObjects.length : 0
    //   }, startPattern=${startPattern}, endPattern=${endPattern}`
    // );

    if (!filepath) {
      console.log('empty filepath; file=' + filepath);
      return result;
    }

    const lineReader = createInterface({
      input: createReadStream(filepath),
    });

    let startAna = !startPattern;
    let endAna = false;
    for await (const line of lineReader) {
      const lowerLine = line.toLowerCase();
      const matchMap: { [key: string]: boolean } = {};

      if (startAna && !endAna) {
        for (const patternObject of patternObjects) {
          if (!patternObject.depends || patternObject.depends in matchMap) {
            if (patternObject.type === 'string') {
              // TimeUseHelper.start('check_string');
              if (lowerLine.includes(patternObject.pattern as string)) {
                const occurence = countOccurrences(
                  lowerLine,
                  patternObject.pattern as string
                );
                result.counterHelper.add(patternObject.name, occurence);
                matchMap[patternObject.name] = true;
              }

              // TimeUseHelper.end('check_string');
            } else {
              let cont = !patternObject.preTest;
              if (patternObject.preTest) {
                cont = line.includes(patternObject.preTest);
              }
              if (cont) {
                // TimeUseHelper.start('check_regex');
                const regExp = patternObject.pattern as RegExp;
                const match = line.match(regExp);
                if (match) {
                  if (!(patternObject.name in matchMap)) {
                    result.counterHelper.add(patternObject.name);
                    matchMap[patternObject.name] = true;
                  }
                  //// handle valueMap
                  if (patternObject.type === 'regex_fn') {
                    const n = parseInt(match[1], 10);
                    let groupName = getFnPatternName(patternObject, n);
                    result.counterHelper.add(groupName);
                  }
                }
              }
            }
            // TimeUseHelper.end('check_regex');
            checkCount++;
          } else {
            skipCount++;
          }
        }
        if (endPattern && line.includes(endPattern)) {
          endAna = true;
        }
        result.anaLineCnt++;
      } else if (!startAna && line.includes(startPattern)) {
        startAna = true;
      }

      result.lineCnt++;
    }
    // console.log(`checkCount=${checkCount}, skipCount=${skipCount}`);

    // console.log(
    //   `startPattern=${startPattern}, endPattern=${endPattern}, startAna=${startAna}, endAna=${endAna}`
    // );

    return result;
  }

  async showPatterns(
    patternObjects: PatternObject[],
    result: AnaCountResult | null
  ) {
    // console.log('showResult');
    // this.counterHelper1.show();
    let str = '';
    str += `Patterns\t${patternObjects.length}\n`;
    if (result) {
      str += `pattern name\t${result.patterns.length}\n`;
    }
    for (const patternObject of patternObjects) {
      str += `name=${patternObject.name}, type=${patternObject.type}, pattern=${patternObject.pattern}, depends=${patternObject.preTest}, depends=${patternObject.preTest}\n`;
      // if (patternObject.type === 'string') {
      //   str += `${patternObject.name}\tstring\t${patternObject.pattern}\n`;
      // } else if (patternObject.type === 'regex') {
      //   str += `${patternObject.name}\tregex\t${patternObject.pattern}\n`;
      // } else if (patternObject.type === 'regex_fn') {
      //   str += `${patternObject.name}\tregex_fn\t${patternObject.pattern}\n`;
      // }
    }
    str += '\n\n';
    console.log(str);
  }

  saveCombinedResult(result: CombinedResult): void {
    const filePath = `logana-combined-output.txt`;
    let str = result.header + '\n';
    for (const line of result.lines) {
      str += line + '\n';
    }
    str += '\n\n';
    writeFileSync(filePath, str);
    // const filename = filepath.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
    // writeFileSync(`output-${filename}.txt`, str);
  }

  saveResult(
    task: AnaCountTask,
    filepath: string,
    result: AnaCountResult
  ): void {
    const str = this.resultToString(task, filepath, result);
    const filePath = `logana-output.txt`;
    appendFileSync(filePath, str);
    // const filename = filepath.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
    // writeFileSync(`output-${filename}.txt`, str);
  }

  clearResultFile() {
    const filePath = `logana-output.txt`;
    writeFileSync(filePath, '');
  }

  showResult(
    task: AnaCountTask,
    filepath: string,
    result: AnaCountResult
  ): void {
    const str = this.resultToString(task, filepath, result);
    console.log(str);
  }

  addResultToCombinedResult(
    task: AnaCountTask,
    filepath: string,
    result: AnaCountResult,
    orgResult: CombinedResult | null = null
  ): CombinedResult {
    let combinedResult = orgResult;

    if (!combinedResult) {
      combinedResult = {
        header: '',
        lines: [],
      };
      let header = 'Result\n';
      if (task.startPattern) {
        header += `startPattern\t'${task.startPattern}'\nendPattern\t'${task.endPattern}'\n`;
      }
      combinedResult.header = header;

      combinedResult.lines.push('file');
      combinedResult.lines.push('lineCnt');
      combinedResult.lines.push('anaLineCnt');
      for (const pattern of result.patterns) {
        combinedResult.lines.push(`${pattern}`);
      }
    }
    const fileName = getFileName(filepath, false);
    combinedResult.lines[0] += `\t${fileName}`;
    combinedResult.lines[1] += `\t${result.lineCnt}`;
    combinedResult.lines[2] += `\t${result.anaLineCnt}`;
    let i = 3;
    for (const pattern of result.patterns) {
      combinedResult.lines[i] += `\t${result.counterHelper.getCounter(
        pattern
      )}`;
      i++;
    }

    return combinedResult;
  }

  resultToString(
    task: AnaCountTask,
    filepath: string,
    result: AnaCountResult
  ): string {
    // console.log('showResult');
    // this.counterHelper1.show();
    let str = 'Result\n';
    str += `filepath\t${filepath}\n`;
    if (task.startPattern) {
      str += `startPattern\t'${task.startPattern}'\nendPattern\t'${task.endPattern}'\n`;
    }
    str += `lineCnt\t${result.lineCnt}\nanaLineCnt\t${result.anaLineCnt}\n`;
    for (const pattern of result.patterns) {
      str += `${pattern}\t${result.counterHelper.getCounter(pattern)}\n`;
    }
    str += '\n\n';
    return str;
  }

  loadConfig(configPath: string): void {
    const config = readFileSyncJson<LogAnalysisConfig>(configPath);
    if (!config) {
      throw new Error(`Cannot read config file ${configPath}`);
    }
    if (!config?.patterns) {
      throw new Error('config.patterns is required');
    }
    if (!config?.files) {
      throw new Error('config.files is required');
    }
    if (!config?.action) {
      throw new Error('config.action is required');
    }

    // console.log(config);
    // const patternObjects: PatternObject[] = [];
    for (const pattern of config.patterns) {
      const patternObject = createPatternObject(pattern);
      this.task.patternObjects.push(patternObject);
    }
    this.task.startPattern = config?.startPattern ?? '';
    this.task.endPattern = config?.endPattern ?? '';
    this.filepaths = config.files;

    console.log(
      `files=${this.filepaths.length}, patterns=${this.task.patternObjects.length}`
    );
    // this.showPatterns(this.task.patternObjects, null);
    // console.log(this.config);
  }
}

const getFnPatternName = (patternObject: PatternObject, n: number): string => {
  let group = patternObject.default;
  if (patternObject.valueMap) {
    for (const key of Object.keys(patternObject.valueMap)) {
      const boundary = patternObject.valueMap[key];
      if (n <= boundary) {
        group = key;
        break;
      }
    }
  }

  return `${patternObject.name}_${group}`;
};

const newAnaCountResult = (task: AnaCountTask): AnaCountResult => {
  const patterns: string[] = [];
  for (const patternObject of task.patternObjects) {
    patterns.push(patternObject.name as string);
    // if (patternObject.type !== 'string') {
    // }
    if (patternObject.type === 'regex_fn') {
      const valueMap = patternObject.valueMap as { [x: string]: number };
      for (const key of Object.keys(valueMap)) {
        patterns.push(`${patternObject.name}_${key}`);
      }
      patterns.push(`${patternObject.name}_${patternObject.default}`);
    }
  }

  return {
    lineCnt: 0,
    anaLineCnt: 0,
    patterns,
    counterHelper: new CounterHelper(),
  };
};

const createPatternObject = (patternConfig: PatternConfig): PatternObject => {
  const obj: PatternObject = {
    type: 'string',
    name: '',
    pattern: new RegExp(''),
    depends: '',
  };

  // PatternObject
  if (typeof patternConfig === 'string') {
    obj.name = patternConfig;
    obj.pattern = patternConfig.toLowerCase();
    ////
  } else if ('pattern' in patternConfig) {
    obj.name = patternConfig.pattern as string;
    obj.depends = patternConfig.depends ?? '';
    obj.pattern = obj.name.toLowerCase();
    ////
  } else {
    obj.name = patternConfig.name;
    obj.depends = patternConfig.depends ?? '';
    obj.preTest = patternConfig.preTest ?? '';
    obj.pattern = new RegExp(patternConfig.regStr ?? '');
    obj.op = patternConfig.op;
    if (!('valueMap' in patternConfig)) {
      obj.type = 'regex';
    } else {
      obj.type = 'regex_fn';
      obj.default = patternConfig.default;
      obj.valueMap = patternConfig.valueMap;
      // obj.values = [];
      // for (const key of Object.keys(pattern.valueMap)) {
      // }
    }
  }

  return obj;
};

// clearResult() {
//   this.result = {
//     lineCnt: 0,
//     anaLineCnt: 0,
//     counterHelper1: new CounterHelper(),
//   };
// }

// getFilePathByName(fileName:string ) {
//   let filepath;
//   if (fileName in this.config.fileMap) {
//     filepath = this.config.fileMap[fileName];
//   } else {
//     filepath = fileName;
//   }
//   return filepath;
// }

// static strIncludesCI(str1, str2) {
//   return str1.includes(str2);
//   // return str1.toLowerCase().includes(str2.toLowerCase());
// }

// loadFileContent(fileName) {
//   let filepath;
//   if (fileName in this.config.fileMap) {
//     filepath = this.config.fileMap[fileName];
//   } else {
//     filepath = fileName;
//   }
//   return fs.readFileSync(filepath, 'utf8');
// }
