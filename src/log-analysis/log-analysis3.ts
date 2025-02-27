// const config = require('./config');
// const fs = require('fs');
// const CounterHelper = require('../helpers/counterHelper');

import readFileSyncJson from '../lib/file-utils.js';
import CounterHelper from '../helpers/counter-helper.js';
import { createReadStream } from 'fs';
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
  // config: LogAnalysisConfig = {
  //   patterns: [],
  //   files: [],
  //   action: '',
  // };
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
    this.runTasks();
  }

  async runTasks() {
    for (const filepath of this.filepaths) {
      // const action = this.config.action;
      // const task: AnaCountTask = {
      //   startPattern: this.config.startPattern ? this.config.startPattern : '',
      //   endPattern: this.config.endPattern ? this.config.endPattern : '',
      // };

      const result = await this.anaCount(this.task, filepath);
      await this.outputResult(this.task, filepath, result);
    }
  }

  // async runTask(task: AnaCountTask, filepath: string): Promise<AnaCountResult> {
  //   // const { action, file, startPattern, endPattern } = task;
  //   // const patterns = { ...this.config.patterns, ...task.patterns };
  //   const action = this.config.action;
  //   const endPattern = '';
  //   // if (action === 'count-pattern') {
  //   //   return await this.anaCount(task);
  //   // }
  //   return await this.anaCount(task, patterns);
  // }

  async anaCount(
    task: AnaCountTask,
    filepath: string
  ): Promise<AnaCountResult> {
    const result: AnaCountResult = newAnaCountResult(task);
    const patternObjects = task.patternObjects;
    const startPattern = task?.startPattern;
    const endPattern = task?.endPattern;

    console.log(
      `filepath=${filepath}, patterns=${
        patternObjects ? patternObjects.length : 0
      }, startPattern=${startPattern}, endPattern=${endPattern}`
    );

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
            if (regExp.test(line)) {
              result.counterHelper.add(patternObject.name);
              //// handle valueMap
              if (patternObject.type === 'regex_fn') {
                let group = `${patternObject.name}_${patternObject.default}`;
                result.counterHelper.add(group);
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

    console.log(
      `startPattern=${startPattern}, endPattern=${endPattern}, startAna=${startAna}, endAna=${endAna}`
    );

    return result;
  }

  async outputResult(
    task: AnaCountTask,
    filepath: string,
    result: AnaCountResult
  ) {
    // console.log('outputResult');
    // this.counterHelper1.show();
    let str = '';
    str += `filepath\t'${filepath}\n`;
    if (task.startPattern) {
      str += `startPattern\t'${task.startPattern}'\nendPattern\t'${task.endPattern}'\n`;
    }
    str += `lineCnt\t${result.lineCnt}\nanaLineCnt\t${result.anaLineCnt}\n`;
    for (const pattern of result.patterns) {
      if (typeof pattern === 'string') {
        str += `${pattern}\t${result.counterHelper.getCounter(pattern)}\n`;
      }
    }
    console.log(str);
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
    console.log(`patterns=${this.task.patternObjects.length}`);
    // console.log(this.config);
  }
}

const newAnaCountResult = (task: AnaCountTask): AnaCountResult => {
  const patterns: string[] = [];
  for (const patternObject of task.patternObjects) {
    if (patternObject.type === 'string') {
      patterns.push(patternObject.pattern as string);
    } else {
      patterns.push(patternObject.name);
      patterns.push(`${patternObject.name}_${patternObject.default}`);
      const valueMap = patternObject.valueMap as { [x: string]: number };
      for (const key of Object.keys(valueMap)) {
        patterns.push(`${patternObject.name}_${key}`);
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
    if ('valueMap' in pattern) {
      obj.type = 'regex_fn';
    } else {
      obj.type = 'regex';
      obj.default = pattern.default;
      obj.valueMap = pattern.valueMap;
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
