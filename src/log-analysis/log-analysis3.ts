// const config = require('./config');
// const fs = require('fs');
// const CounterHelper = require('../helpers/counterHelper');

import readFileSyncJson from '../lib/file-utils.js';
import CounterHelper from '../helpers/counter-helper.js';
import { createReadStream, writeFileSync, appendFileSync } from 'fs';
import { createInterface } from 'readline';

type PatternConfig =
  | string
  | {
      name: string;
      regStr: string;
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
    this.clearResultFile();
    for (const filepath of this.filepaths) {
      console.time('runTask');
      const result = await this.anaCount(this.task, filepath);
      console.timeEnd('runTask');
      this.showResult(this.task, filepath, result);
      this.saveResult(this.task, filepath, result);
    }
  }

  async anaCount(
    task: AnaCountTask,
    filepath: string
  ): Promise<AnaCountResult> {
    const result: AnaCountResult = newAnaCountResult(task);
    const patternObjects = task.patternObjects;
    const startPattern = task?.startPattern;
    const endPattern = task?.endPattern;

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

      if (startAna && !endAna) {
        for (const patternObject of patternObjects) {
          if (patternObject.type === 'string') {
            if (lowerLine.includes(patternObject.pattern as string)) {
              result.counterHelper.add(patternObject.name);
            }
          } else {
            const regExp = patternObject.pattern as RegExp;
            const match = line.match(regExp);
            if (match) {
              result.counterHelper.add(patternObject.name);
              //// handle valueMap
              if (patternObject.type === 'regex_fn') {
                const n = parseInt(match[1], 10);
                // if (0 <= n && n <= 120000) {
                // } else {
                //   console.log(`special ${n} `, match);
                //   //match[1], ${match[1]}, line=${line}
                // }
                let groupName = getFnPatternName(patternObject, n);
                result.counterHelper.add(groupName);
              }
            }
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
      if (patternObject.type === 'string') {
        str += `${patternObject.name}\tstring\t${patternObject.pattern}\n`;
      } else if (patternObject.type === 'regex') {
        str += `${patternObject.name}\tregex\t${patternObject.pattern}\n`;
      } else if (patternObject.type === 'regex_fn') {
        str += `${patternObject.name}\tregex_fn\t${patternObject.pattern}\n`;
      }
    }
    str += '\n\n';
    console.log(str);
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
    this.showPatterns(this.task.patternObjects, null);
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
    if (patternObject.type === 'string') {
      patterns.push(patternObject.pattern as string);
    } else {
      patterns.push(patternObject.name);
      if (patternObject.type === 'regex_fn') {
        const valueMap = patternObject.valueMap as { [x: string]: number };
        for (const key of Object.keys(valueMap)) {
          patterns.push(`${patternObject.name}_${key}`);
        }
        patterns.push(`${patternObject.name}_${patternObject.default}`);
      }
    }
  }

  return {
    lineCnt: 0,
    anaLineCnt: 0,
    patterns,
    counterHelper: new CounterHelper(),
  };
};

const createPatternObject = (pattern: PatternConfig): PatternObject => {
  const obj: PatternObject = {
    type: 'string',
    name: '',
    pattern: new RegExp(''),
  };

  // PatternObject
  if (typeof pattern === 'string') {
    obj.name = pattern;
    obj.pattern = pattern.toLowerCase();
  } else {
    obj.name = pattern.name;
    obj.pattern = new RegExp(pattern.regStr);
    obj.op = pattern.op;
    if (!('valueMap' in pattern)) {
      obj.type = 'regex';
    } else {
      obj.type = 'regex_fn';
      obj.default = pattern.default;
      obj.valueMap = pattern.valueMap;
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
