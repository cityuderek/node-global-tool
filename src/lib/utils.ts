import { CommanderError } from 'commander';
// import { readFile } from 'fs/promises';
// import { fileURLToPath } from 'url';
// import path from 'path';
import * as fs from 'fs';

export const countOccurrences = (str: string, subStr: string): number => {
  // Split the string by the substring and return the length of the resulting array minus one
  return str.split(subStr).length - 1;
};

export const msToDisplayString = (n: number): string => {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 's';
  } else if (n >= 1) {
    return n.toFixed(1) + 'ms';
  } else {
    return (n * 1000).toFixed(1) + 'µs';
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

// // Get the directory name of the current module file
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Construct the path to package.json
// const packageJsonPath = path.resolve(__dirname, '../package.json');

// export async function getVersion() {
//   try {
//     const data = await readFile(packageJsonPath, 'utf-8');
//     const packageJson = JSON.parse(data);
//     console.log('Version:', packageJson.version);
//   } catch (error) {
//     console.error('Error reading package.json:', error);
//   }
// }
export const readEnvFileToJson = (envFilePath: string): any => {
  const env: any = {};
  try {
    const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
    if (!envFileContent) {
      return {};
    }
    const lines = envFileContent.split('\n');

    lines.forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
  } catch (err) {}

  return env;
};

export const split = (str: string, seperator: string, targetLen: number) => {
  let strs = str.split(seperator);
  return fixArrLen(strs, targetLen, '');
};

export const fixArrLen = (arr: any[], targetLen: number, fillValue: any) => {
  if (arr.length > targetLen) {
    return arr.slice(0, targetLen);
  } else if (arr.length < targetLen) {
    return [...arr, ...Array(targetLen - arr.length).fill(fillValue)];
  }

  return arr;
};

//// For commander
export const cmdParseInteger = (value: string): number => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new CommanderError(
      1,
      'parseInt',
      `Value '${value}' is not an integer.`
    );
  }
  return parsedValue;
};

export const cmdParseFloat = (value: string): number => {
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) {
    throw new CommanderError(
      1,
      'parseFloat',
      `Value '${value}' is not a number.`
    );
  }
  return parsedValue;
};
