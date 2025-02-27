import * as fs from 'fs';

export const readFileSyncJson = <T = any>(filePath: string): T => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    return jsonData;
  } catch (error: any) {
    console.error(`Error reading or parsing file ${filePath}:`, error.message);
    throw error; // Re-throw the error to handle it outside the function
  }
};

export const getFileName = (
  filePath: string,
  withExt: boolean = true
): string => {
  const fileName = filePath.replace(/^.*[\\/]/, '');
  if (withExt) {
    return fileName;
  }
  return filePath.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
};
