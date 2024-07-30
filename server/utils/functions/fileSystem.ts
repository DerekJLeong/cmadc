import { promises as fsPromises } from 'fs';
import { openAIFunction } from './openAiFunction.js';

const { open, writeFile, readFile, unlink, rename, mkdir, rmdir } = fsPromises;

export class FileSystemFunctions {
  @openAIFunction("Creates a file", {
    filename: {
      type: "string",
      description: "The name of the file to create",
      required: true,
    },
    content: {
      type: "string",
      description: "The content of the file to create",
      required: true,
    },
  })
  async createFile(filename: string, content: string): Promise<string> {
    await writeFile(filename, content);
    return `File ${filename} created`;
  }

  @openAIFunction("Reads a file", {
    filename: {
      type: "string",
      description: "The name of the file to read",
      required: true,
    },
  })
  async readFile(filename: string): Promise<string> {
    const content = await readFile(filename, { encoding: 'utf-8' });
    return content;
  }

  @openAIFunction("Deletes a file", {
    filename: {
      type: "string",
      description: "The name of the file to delete",
      required: true,
    },
  })
  async deleteFile(filename: string): Promise<string> {
    await unlink(filename);
    return `File ${filename} deleted`;
  }

  @openAIFunction("Renames a file", {
    filename: {
      type: "string",
      description: "The current name of the file",
      required: true,
    },
    newFilename: {
      type: "string",
      description: "The new name of the file",
      required: true,
    },
  })
  async renameFile(filename: string, newFilename: string): Promise<string> {
    await rename(filename, newFilename);
    return `File ${filename} renamed to ${newFilename}`;
  }

  @openAIFunction("Edits a file", {
    filename: {
      type: "string",
      description: "The name of the file to edit",
      required: true,
    },
    content: {
      type: "string",
      description: "The new content of the file",
      required: true,
    },
  })
  async editFile(filename: string, content: string): Promise<string> {
    await writeFile(filename, content);
    return `File ${filename} edited`;
  }

  @openAIFunction("Creates a directory", {
    directoryName: {
      type: "string",
      description: "The name of the directory to create",
      required: true,
    },
  })
  async createDirectory(directoryName: string): Promise<string> {
    await mkdir(directoryName);
    return `Directory ${directoryName} created`;
  }

  @openAIFunction("Deletes a directory", {
    directoryName: {
      type: "string",
      description: "The name of the directory to delete",
      required: true,
    },
  })
  async deleteDirectory(directoryName: string): Promise<string> {
    await rmdir(directoryName);
    return `Directory ${directoryName} deleted`;
  }

  @openAIFunction("Renames a directory", {
    directoryName: {
      type: "string",
      description: "The current name of the directory",
      required: true,
    },
    newDirectoryName: {
      type: "string",
      description: "The new name of the directory",
      required: true,
    },
  })
  async renameDirectory(
    directoryName: string,
    newDirectoryName: string
  ): Promise<string> {
    await rename(directoryName, newDirectoryName);
    return `Directory ${directoryName} renamed to ${newDirectoryName}`;
  }
}
