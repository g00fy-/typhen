/// <reference path='../../typings/tsd.d.ts' />

import fs = require('fs');
import path = require('path');
import mkdirp = require('mkdirp');
import _ = require('lodash');

import Logger = require('../logger');
import Environment = require('./environment');

class NodeJsEnvironment implements Environment {
  public currentDirectory: string;
  public useCaseSensitiveFileNames: boolean = false;
  public defaultLibFileName: string = path.resolve(__dirname, '../../lib.typhen.d.ts');
  private baseDefaultLibFileName: string = path.resolve(__dirname, '../../lib.d.ts'); // Concatenate with lib.typhen.d.ts

  constructor(currentDirectory: string, public newLine: string, baseDefaultLibFileName?: string) {
    this.currentDirectory = path.resolve(currentDirectory);

    if (_.isString(baseDefaultLibFileName) && baseDefaultLibFileName.length > 0) {
      this.baseDefaultLibFileName = this.resolvePath(baseDefaultLibFileName);
    }
  }

  public readFile(fileName: string): string {
    var resolvedPath = this.resolvePath(fileName);

    if (resolvedPath === this.defaultLibFileName) {
      return this.getDefaultLibFileData();
    } else {
      Logger.debug('Reading: ' + resolvedPath);
      return fs.readFileSync(resolvedPath, 'utf-8');
    }
  }

  public writeFile(fileName: string, data: string): void {
    var filePath = this.resolvePath(fileName);
    Logger.debug('Writing: ' + filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
  }

  public resolvePath(...pathSegments: string[]): string {
    var args = _.flatten([[this.currentDirectory], pathSegments], true);
    return path.resolve.apply(null, args);
  }

  public relativePath(from: string, to?: string): string {
    if (to === undefined) {
      to = from;
      from = this.currentDirectory;
    }
    return path.relative(from, to);
  }

  public dirname(fileName: string): string {
    return path.dirname(fileName);
  }

  public exists(fileName: string): boolean {
    var filePath = this.resolvePath(fileName);
    return fs.existsSync(filePath);
  }

  public getDefaultLibFileData(): string {
    Logger.debug('Reading dafaultLibFile data');
    var defaultLibFileData = fs.readFileSync(this.defaultLibFileName, 'utf-8');
    var baseDefaultLibFileData = fs.readFileSync(this.baseDefaultLibFileName, 'utf-8').replace(/\r\n/g, '\n');
    return defaultLibFileData.replace(
        /^\/\/\/\s*<reference\s+path="[^"]+"\s*\/>/mi,
        '\n' + baseDefaultLibFileData + '\n');
  }
}

export = NodeJsEnvironment;
