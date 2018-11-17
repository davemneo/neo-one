import * as path from 'path';

export interface BuildTaskListOptions {
  readonly command: 'build';
  readonly rootDir: string;
}

export interface ResetTaskListOptions {
  readonly command: 'reset';
  readonly projectID?: string;
  readonly rootDir?: string;
}

export type ExecuteTaskListOptions = BuildTaskListOptions | ResetTaskListOptions;

export interface NetworkRequestOptions {
  readonly type: 'network';
  readonly projectID: string;
}

export interface SourceMapsRequestOptions {
  readonly type: 'sourceMaps';
  readonly projectID: string;
}

export interface NEOTrackerRequestOptions {
  readonly type: 'neotracker';
  readonly projectID: string;
}

export type RequestOptions = NetworkRequestOptions | SourceMapsRequestOptions | NEOTrackerRequestOptions;

export type CodegenLanguage = 'javascript' | 'typescript';
export type CodegenFramework = 'none' | 'react' | 'angular' | 'vue';

export interface ProjectConfig {
  readonly paths: {
    readonly contracts: string;
    readonly generated: string;
  };
  readonly codegen: {
    readonly language: CodegenLanguage;
    readonly framework: CodegenFramework;
  };
}

export const projectConfigSchema = {
  paths: {
    contracts: {
      format: String,
      default: path.join('one', 'contracts'),
    },
    generated: {
      format: String,
      default: path.join('one', 'generated'),
    },
  },
  codegen: {
    language: {
      format: typeof CodegenLanguage,
      default: 0,
    },
    framework: {
      format: CodegenFramework,
      default: 0,
    },
    default: { language: { format: 'javascript' }, framework: { format: 'none' } },
  },
};
