import { CommanderError } from 'commander';
// import { readFile } from 'fs/promises';
// import { fileURLToPath } from 'url';
// import path from 'path';

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
