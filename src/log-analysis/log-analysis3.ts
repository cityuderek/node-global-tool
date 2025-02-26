// const config = require('./config');
// const fs = require('fs');
// const CounterHelper = require('../helpers/counterHelper');

import readFileSyncJson from '../lib/file-utils.js';
import CounterHelper from '../helpers/counter-helper.js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

interface PatternObject {
  name: string;
  patternReg: RegExp;
  getNameFunc?: () => string;
}

type LogAnalysisConfig = {
  action: string;
  files: string[];
  patterns: string[];
  startPattern?: string;
  endPattern?: string;
};

type AnaCountTask = {
  filepath: string;
  patterns: string[];
  startPattern: string;
  endPattern: string;
};

type AnaCountResult = {
  lineCnt: number;
  anaLineCnt: number;
  counterHelper: CounterHelper;
};

const newAnaCountResult = (): AnaCountResult => {
  return {
    lineCnt: 0,
    anaLineCnt: 0,
    counterHelper: new CounterHelper(),
  };
};

export class LogAnalysis3 {
  config: LogAnalysisConfig = {
    patterns: [],
    files: [],
    action: '',
  };
  tasks: AnaCountTask[] = [];

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
    for (const file of this.config.files) {
      // const action = this.config.action;
      const patterns = this.config.patterns;
      const task = {
        filepath: file,
        patterns: patterns,
        startPattern: this.config.startPattern ? this.config.startPattern : '',
        endPattern: this.config.endPattern ? this.config.endPattern : '',
      };

      const result = await this.runTask(task);
      await this.outputResult(task, result);
    }
  }

  async runTask(task: AnaCountTask): Promise<AnaCountResult> {
    // const { action, file, startPattern, endPattern } = task;
    // const patterns = { ...this.config.patterns, ...task.patterns };
    const action = this.config.action;
    const patterns = this.config.patterns;
    const endPattern = '';
    // if (action === 'count-pattern') {
    //   return await this.anaCount(task);
    // }
    return await this.anaCount(task);
  }

  async anaCount({
    filepath,
    patterns,
    startPattern,
    endPattern,
  }: AnaCountTask): Promise<AnaCountResult> {
    const result: AnaCountResult = newAnaCountResult();

    console.log(
      `filepath=${filepath}, patterns=${patterns ? patterns.length : 0}`
    );

    if (!filepath) {
      console.log('empty filepath; file=' + filepath);
      return result;
    }

    const lowerPatternMap: Record<string, string> = {};
    patterns.forEach((p) => {
      if (typeof p === 'string') {
        lowerPatternMap[p] = p.toLowerCase();
      }
    });

    const lineReader = createInterface({
      input: createReadStream(filepath),
    });

    let startAna = !startPattern;
    let endAna = false;

    for await (const line of lineReader) {
      const lowerLine = line.toLowerCase();

      if (startAna && !endAna) {
        for (const pattern of patterns) {
          if (
            typeof pattern === 'string' &&
            lowerLine.includes(lowerPatternMap[pattern])
          ) {
            result.counterHelper.add(pattern);
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

  async outputResult(task: AnaCountTask, result: AnaCountResult) {
    // console.log('outputResult');
    // this.counterHelper1.show();
    let str = '';
    if (task.startPattern) {
      str += `startPattern\t'${task.startPattern}'\nendPattern\t'${task.endPattern}'\n`;
    }
    str += `lineCnt\t${result.lineCnt}\nanaLineCnt\t${result.anaLineCnt}\n`;
    for (const pattern of task.patterns) {
      if (typeof pattern === 'string') {
        str += `pattern=${pattern}\t${result.counterHelper.getCounter(
          pattern
        )}\n`;
      }
    }
    console.log(str);
  }

  loadConfig(configPath: string): void {
    const config = readFileSyncJson<LogAnalysisConfig>(configPath);
    this.config = config;
    if (!this.config?.patterns) {
      throw new Error('config.patterns is required');
    }
    if (!this.config?.files) {
      throw new Error('config.files is required');
    }
    if (!this.config?.action) {
      throw new Error('config.action is required');
    }

    console.log(config);
    const patternObjects = [];

    for (const pattern of config.patterns) {
      let name: string;
      let patternReg: RegExp;
      let getNameFunc: () => string;

      // PatternObject
      if (typeof pattern === 'string') {
        patternReg = new RegExp(pattern, 'i');
        const patternObject: PatternObject = {
          name: pattern,
          patternReg,
        };
        patternObjects.push(patternObject);
      } else {
        // pattern.reg = new RegExp(pattern.regStr);
        //// TODO
        ////reg
      }
    }

    // for (const task of config.tasks) {
    //   task.patternObjects = patternObjects;
    // }

    console.log(this.config);
  }

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
}
