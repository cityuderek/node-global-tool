// import * as fs from 'fs-extra';
import fs from 'fs-extra';
// import { createReadStream, writeFile } from 'fs';
// import * as path from 'path';
import * as glob from 'glob';
import * as readline from 'readline';

interface Command {
  type: 'string' | 'regex';
  from: string;
  to: string;
  flags: string;
}

const readConfigFile = async (configFilePath: string): Promise<Command[]> => {
  const commands: Command[] = [];
  const fileStream = fs.createReadStream(configFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const [type, from, to, flags] = line.split('\t');
    if (type && from && to) {
      commands.push({
        type: type as 'string' | 'regex',
        from,
        to,
        flags: flags || '',
      });
    }
  }
  // console.log(`readConfigFile: configFilePath=${configFilePath}`, commands);
  console.log(
    `Config: configFilePath=${configFilePath}, length=${commands.length}`
  );
  return commands;
};

const replaceInFile = async (
  filePath: string,
  commands: Command[]
): Promise<boolean> => {
  console.log(`replaceInFile: ${filePath}`);
  let hasChange = false;
  try {
    const orgContent = await fs.readFile(filePath, 'utf-8');
    let content = orgContent;
    commands.forEach((command) => {
      let regex: RegExp;
      if (command.type === 'regex') {
        regex = new RegExp(command.from, command.flags);
        // content = content.replace(regex, command.to);
        content = content.replace(regex, () =>
          command.to
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r')
            .replace(/\\n/g, '\n')
        );
      } else {
        content = content.replace(command.from, command.to);
      }
    });
    hasChange = content !== orgContent;
    if (hasChange) {
      await fs.writeFile(filePath, content, 'utf-8');
    }
    // console.log(`Processed file: ${filePath}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(`Error processing file ${filePath}: ${errorMessage}`);
    throw error;
  }
  return hasChange;
};

const processFiles = async (
  searchPath: string,
  commands: Command[]
): Promise<number[]> => {
  const searchPath2 = searchPath.replaceAll('\\', '/');
  let totalCount = 0;
  let updatedCount = 0;
  try {
    const files = glob.sync(searchPath2, { nodir: true });
    totalCount = files.length;
    for (const file of files) {
      if (await replaceInFile(file, commands)) {
        updatedCount++;
      }
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(`Error processing files: ${errorMessage}`);
    throw error;
  }
  console.error(`Total files=${totalCount}, updated files=${updatedCount}`);
  return [totalCount, updatedCount];
};

export const dsed = async (
  searchPath: string,
  configFilePath: string
): Promise<void> => {
  try {
    const commands = await readConfigFile(configFilePath);
    await processFiles(searchPath, commands);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(`Error processing files: ${errorMessage}`);
    throw error;
  }
};

// const main = async (): Promise<void> => {
//   const [, , searchPath, configFilePath] = process.argv;
//   if (!searchPath || !configFilePath) {
//     console.error('Usage: ts-node replace.ts <path-to-search> <config-file>');
//     process.exit(1);
//   }

//   try {
//     const commands = await readConfigFile(configFilePath);
//     await processFiles(searchPath, commands);
//   } catch (error) {
//     const errorMessage = (error as Error).message;
//     console.error(`Error: ${errorMessage}`);
//     process.exit(1);
//   }
// };

// main().catch((error) => console.error(error));
