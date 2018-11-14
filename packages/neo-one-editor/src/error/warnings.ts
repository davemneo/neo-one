/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// tslint:disable
import { ReactFrame } from './effects/proxyConsole';

function stripInlineStacktrace(message: string): string {
  return message
    .split('\n')
    .filter((line) => !line.match(/^\s*in/))
    .join('\n'); // "  in Foo"
}

export function massage(warning: string, frames: ReadonlyArray<ReactFrame>): { message: string; stack: string } {
  let message = stripInlineStacktrace(warning);

  // Reassemble the stack with full filenames provided by React
  let stack = '';
  let lastFilename;
  let lastLineNumber;
  for (let index = 0; index < frames.length; ++index) {
    const { fileName, lineNumber } = frames[index];
    if (fileName == null || lineNumber == null) {
      continue;
    }

    // TODO: instead, collapse them in the UI
    if (
      fileName === lastFilename &&
      typeof lineNumber === 'number' &&
      typeof lastLineNumber === 'number' &&
      Math.abs(lineNumber - lastLineNumber) < 3
    ) {
      continue;
    }
    lastFilename = fileName;
    lastLineNumber = lineNumber;

    let { name } = frames[index];
    name = name || '(anonymous function)';
    stack += `in ${name} (at ${fileName}:${lineNumber})\n`;
  }

  return { message, stack };
}
