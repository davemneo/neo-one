const _ = require('lodash');
const appRootDir = require('app-root-dir');
const execa = require('execa');
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpFilter = require('gulp-filter');
const gulpNewer = require('gulp-newer');
const gulpPlumber = require('gulp-plumber');
const gulpRename = require('gulp-rename');
const gulpReplace = require('gulp-replace');
const gulpBanner = require('gulp-banner');
const jsonTransform = require('gulp-json-transform');
const gulpSourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const path = require('path');
const through2 = require('through2');
const typescript = require('typescript');
const pkg = require('./package.json');
const webpack = require('webpack');

const rollup = require('rollup');
const rollupString = require('rollup-plugin-string');
const rollupTypescript = require('rollup-plugin-typescript2');

const rxjsTypes = new Set(['Observer']);

const transformRxjsImportText = (importName) =>
  importName === 'EMPTY'
    ? 'rxjs/internal/observable/empty'
    : rxjsTypes.has(importName)
    ? 'rxjs/internal/types'
    : importName[0].toLowerCase() === importName[0]
    ? `rxjs/internal/observable/${importName}`
    : `rxjs/internal/${importName}`;

const transformRxjsOperatorsImportText = (importName) => `rxjs/internal/operators/${importName}`;

const updateRxjsImportStatements = (callback, statement) =>
  statement.importClause.namedBindings.elements.map((elem) =>
    typescript.createImportDeclaration(
      statement.decorators,
      statement.modifiers,
      typescript.createImportClause(
        undefined,
        typescript.createNamedImports([typescript.createImportSpecifier(elem.propertyName, elem.name)]),
      ),
      typescript.createStringLiteral(
        callback(elem.propertyName === undefined ? elem.name.getText() : elem.propertyName.getText()),
      ),
    ),
  );

const RXJS_IMPORT = 'rxjs';
const RXJS_OPERATORS_IMPORT = 'rxjs/operators';

const transformImports = (statements) =>
  _.flattenDeep(
    statements.map((statement) => {
      if (typescript.isImportDeclaration(statement)) {
        const moduleName = statement.moduleSpecifier.text;

        if (moduleName === RXJS_IMPORT) {
          return updateRxjsImportStatements(transformRxjsImportText, statement);
        }
        if (moduleName === RXJS_OPERATORS_IMPORT) {
          return updateRxjsImportStatements(transformRxjsOperatorsImportText, statement);
        }
      }

      return statement;
    }),
  );

const createCustomTransform = (context) => {
  return (node) => {
    const visitor = (node) => {
      if (typescript.isSourceFile(node)) {
        const statements = transformImports(node.statements);

        return typescript.updateSourceFileNode(
          node,
          statements,
          node.isDeclarationFile,
          node.referencedFiles,
          node.typeReferences,
          node.hasNoDefaultLib,
          node.libReferences,
        );
      }
      return node;
    };

    return typescript.visitNode(node, visitor);
  };
};

const createFormatDistName = ({ main, target, module, browser }) => {
  if (main) {
    return 'neo-one';
  }
  if (browser) {
    return 'neo-one-browserify';
  }

  return `neo-one-${target}-${module}`;
};

const createFormatName = ({ main, target, module, browser }) => {
  if (main) {
    return '';
  }
  if (browser) {
    return 'browserify';
  }

  return `${target}-${module}`;
};

const FORMATS = [
  {
    main: true,
    target: 'es2017',
    module: 'cjs',
  },
  {
    target: 'esnext',
    module: 'esm',
  },
  {
    target: 'es2017',
    module: 'cjs',
    browser: true,
  },
].map(({ target, module, main, browser }) => ({
  target,
  module,
  browser: browser === true,
  dist: createFormatDistName({ main, target, module, browser }),
  name: createFormatName({ main, target, module, browser }),
  tsconfig: `tsconfig/tsconfig.${target}.${browser ? 'browserify.' : ''}${module}.json`,
  tsconfigESM: `tsconfig/tsconfig.${target}.esm.json`,
  fastProject: ts.createProject(`tsconfig/tsconfig.${target}.${browser ? 'browserify.' : ''}${module}.json`, {
    typescript,
    isolatedModules: true,
  }),
  project: ts.createProject(`tsconfig/tsconfig.${target}.${browser ? 'browserify.' : ''}${module}.json`, {
    typescript,
  }),
}));
const MAIN_FORMAT = FORMATS[0];
const MAIN_BIN_FORMAT = FORMATS[0];

function getTaskHash(format, ...args) {
  return (format.browser ? [format.target, format.module, 'browserify'] : [format.target, format.module])
    .concat(args.filter((x) => x !== void 0 && x !== ''))
    .join(`:`);
}

let noCache = false;
const memoizeTask = (cache, taskFn) => (format, ...args) => {
  // Give the memoized fn a displayName so gulp's output is easier to follow.
  const fn = (done) => {
    if (noCache) {
      return taskFn(format, done, ...args);
    }

    return cache[getTaskHash(format, ...args)] || (cache[getTaskHash(format, ...args)] = taskFn(format, done, ...args));
  };
  fn.displayName = `${taskFn.name || ``}:${getTaskHash(format, ...args)}:task`;

  return fn;
};

const DIST = 'dist';
const getDistBase = (format) => path.join(DIST, format.dist);
const getDistBaseCWD = (format) => path.resolve(appRootDir.get(), getDistBase(format));
const getDest = (format) => path.join(getDistBase(format), 'packages');

const getPackageJSON = (pkg) => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve('packages', pkg, 'package.json'), 'utf-8'));
  } catch (error) {
    console.log(`Invalid package.json: ${pkg}`);
    console.error(error);
    throw error;
  }
};

const SKIP_PACKAGES = new Set([
  'neo-one-developer-tools-frame',
  'neo-one-editor',
  'neo-one-editor-server',
  'neo-one-local-browser',
  'neo-one-local-browser-worker',
  'neo-one-local-singleton',
  'neo-one-node-browser',
  'neo-one-node-browser-worker',
  'neo-one-smart-contract-test-browser',
  'neo-one-website',
  'neo-one-worker',
]);
const SKIP_PACKAGES_LIST = [...SKIP_PACKAGES];

const getPackageJSONs = () => {
  const pkgs = fs
    .readdirSync('packages')
    .filter((file) => !file.startsWith('.'))
    .filter((file) => !SKIP_PACKAGES.has(file))
    .filter((pkg) => fs.pathExistsSync(path.resolve('packages', pkg, 'package.json')));
  const pkgJSONs = pkgs.map((pkg) => [pkg, getPackageJSON(pkg)]);

  return { pkgs, pkgJSONs };
};

const { pkgs, pkgJSONs } = getPackageJSONs();
const smartContractPkgs = pkgJSONs.filter(([_p, pkgJSON]) => pkgJSON.smartContract).map(([p]) => p);
const smartContractPkgNames = pkgJSONs
  .filter(([_p, pkgJSON]) => pkgJSON.smartContract)
  .map(([_p, pkgJSON]) => pkgJSON.name);
const browserPkgs = pkgJSONs.filter(([_p, pkgJSON]) => pkgJSON.browser !== undefined).map(([p]) => p);
const browserPkgNames = pkgJSONs
  .filter(([_p, pkgJSON]) => pkgJSON.browser !== undefined)
  .map(([_p, pkgJSON]) => pkgJSON.name);
const indexPkgs = pkgs.filter((p) => !smartContractPkgs.includes(p));
const pkgNames = pkgJSONs.map(([_p, pkgJSON]) => pkgJSON.name);
const pkgNamesSet = new Set(pkgNames);

const skipGlobs = SKIP_PACKAGES_LIST.map((pkg) => `!packages/${pkg}/**/*`);

const globs = {
  originalSrc: [
    'packages/*/src/**/*.{ts,tsx,js}',
    'packages/*/template/**/*',
    'packages/*/proto/**/*.proto',
    '!packages/*/src/**/*.test.{ts,tsx}',
    '!packages/*/src/__data__/**/*',
    '!packages/*/src/__tests__/**/*',
    '!packages/*/src/__e2e__/**/*',
    '!packages/*/src/bin/**/*',
  ].concat(skipGlobs),
  src: [
    `packages/*/src/**/*.{ts,tsx}`,
    `!packages/*/src/**/*.test.{ts,tsx}`,
    `!packages/*/src/__data__/**/*`,
    `!packages/*/src/__tests__/**/*`,
    `!packages/*/src/__e2e__/**/*`,
    `!packages/*/src/bin/**/*`,
    `!packages/neo-one-developer-tools-frame/src/*.ts`,
    `!packages/neo-one-smart-contract-lib/src/*.ts`,
    `!packages/neo-one-server-plugin-wallet/src/contracts/*.ts`,
  ].concat(skipGlobs),
  types: ['packages/neo-one-types/**/*', '!packages/neo-one-types/package.json'],
  bin: ['packages/*/src/bin/*.ts'].concat(skipGlobs),
  pkg: ['packages/*/package.json'].concat(skipGlobs),
  typescript: ['packages/*/src/**/*.ts'].concat(skipGlobs),
  pkgFiles: [
    'packages/*/CHANGELOG.md',
    'packages/*/tsconfig.json',
    'packages/*/static/**/*',
    'packages/*/template/**/*',
    'packages/*/proto/**/*.proto',
  ].concat(skipGlobs),

  files: ['lerna.json', 'yarn.lock', 'tsconfig.json'],
  metadata: ['LICENSE', 'README.md'],
};

const getName = (format, name) => (format.name === '' ? name : `${name}-${format.name}`);
const getBin = (format, file) => {
  if (format.name !== '') {
    return undefined;
  }

  const pkgPath = path.join('packages', path.dirname(file.relative));
  const binDir = path.join(pkgPath, 'src', 'bin');
  const exists = fs.existsSync(binDir);
  if (!exists) {
    return undefined;
  }

  const binFiles = fs.readdirSync(binDir);
  return _.fromPairs(
    _.flatMap(
      binFiles.map((binFile) => {
        const fileName = path.basename(binFile, '.ts');
        return [[fileName, `./bin/${fileName}`], [`${fileName}.js`, `./bin/${fileName}.js`]];
      }),
    ),
  );
};
const DEP_MAPPING = {
  esnext: {
    esm: {
      '@reactivex/ix-es2015-cjs': '@reactivex/ix-esnext-esm',
    },
    cjs: {
      '@reactivex/ix-es2015-cjs': '@reactivex/ix-esnext-cjs',
    },
  },
  es2017: {
    esm: {
      '@reactivex/ix-es2015-cjs': '@reactivex/ix-es2015-esm',
    },
    cjs: {},
  },
};
const mapDep = (format, depName) => {
  if (pkgNamesSet.has(depName)) {
    return getName(format, depName);
  }

  if (DEP_MAPPING[format.target][format.module][depName] !== undefined) {
    return DEP_MAPPING[format.target][format.module][depName];
  }

  if (format.browser && depName.includes('@neo-one/') && !depName.includes('ec-key')) {
    return `${depName}-browserify`;
  }

  return depName;
};

const transformBasePackageJSON = (format, orig, file) => {
  const bin = getBin(format, file);

  return {
    name: format.name === '' ? orig.name : `${orig.name}-${format.name}`,
    version: orig.version,
    author: pkg.author,
    description: orig.description,
    license: pkg.license,
    homepage: pkg.homepage,
    repository: pkg.repository,
    bugs: pkg.bugs,
    keywords: pkg.keywords,
    bin,
    dependencies:
      orig.dependencies === undefined
        ? undefined
        : _.fromPairs(
            Object.entries(orig.dependencies)
              .filter(([depName]) => depName !== '@neo-one/developer-tools-frame')
              .map(([depName, version]) => [mapDep(format, depName), version]),
          ),
    publishConfig: {
      access: 'public',
    },
    engines: pkg.engines,
  };
};

const transformSrcPackageJSON = (format, orig, file) => ({
  ...transformBasePackageJSON(format, orig, file),
  main: 'index.js',
  module: format.module === 'esm' ? 'index.js' : undefined,
  types: 'index.d.ts',
  sideEffects: false,
});

const transformSmartContractPackageJSON = (format, orig, file) => ({
  ...transformBasePackageJSON(format, orig, file),
  main: orig.main.startsWith('./src/') ? orig.main.slice('./src/'.length) : orig.main,
  include: orig.include === undefined ? undefined : orig.include.map((filepath) => filepath.slice(0, 'src/'.length)),
});

const transformBrowserPackageJSON = (format, orig, file) => ({
  ...transformSrcPackageJSON(format, orig, file),
  browser: 'index.browser.js',
});

const transformTypesPackageJSON = (format, orig, file) => ({
  ...transformBasePackageJSON(format, orig, file),
  main: 'index.d.ts',
});

const transformPackageJSON = (format, orig, file) =>
  orig.name === '@neo-one/types'
    ? transformTypesPackageJSON(format, orig, file)
    : smartContractPkgNames.some((p) => orig.name === p)
    ? transformSmartContractPackageJSON(format, orig, file)
    : browserPkgNames.some((p) => orig.name === p)
    ? transformBrowserPackageJSON(format, orig, file)
    : transformSrcPackageJSON(format, orig, file);

const copyPkg = ((cache) =>
  memoizeTask(cache, function copyPkg(format) {
    return gulp
      .src(globs.pkg)
      .pipe(jsonTransform((orig, file) => transformPackageJSON(format, orig, file), 2))
      .pipe(gulp.dest(getDest(format)));
  }))({});

const copyPkgFiles = ((cache) =>
  memoizeTask(cache, function copyPkgFiles(format) {
    return gulp.src(globs.pkgFiles).pipe(gulp.dest(getDest(format)));
  }))({});

const copyTypes = ((cache) =>
  memoizeTask(cache, function copyTypes(format) {
    return gulp.src(globs.types).pipe(gulp.dest(path.join(getDest(format), 'neo-one-types')));
  }))({});

const copyTypescript = ((cache) =>
  memoizeTask(cache, function copyTypescript(format) {
    return gulp
      .src(globs.typescript)
      .pipe(
        gulpFilter([
          'packages/neo-one-smart-contract-lib/src/**/*.ts',
          'packages/neo-one-smart-contract/src/*.ts',
          'packages/neo-one-server-plugin-wallet/src/contracts/*.ts',
        ]),
      )
      .pipe(
        gulpRename((name) => {
          name.dirname = name.dirname
            .split(path.sep)
            .filter((dir) => dir !== 'src')
            .join(path.sep);
        }),
      )
      .pipe(gulp.dest(getDest(format)));
  }))({});

const copyMetadata = ((cache) =>
  memoizeTask(cache, function copyMetadata(format) {
    return pkgs.reduce((stream, p) => stream.pipe(gulp.dest(path.join(getDest(format), p))), gulp.src(globs.metadata));
  }))({});

const copyFiles = ((cache) =>
  memoizeTask(cache, function copyFiles(format) {
    return gulp.src(globs.files).pipe(gulp.dest(getDistBase(format)));
  }))({});

const addFast = (format, stream, shouldAdd) =>
  shouldAdd ? stream.pipe(gulpPlumber()).pipe(gulpNewer({ dest: getDest(format), ext: '.js' })) : stream;

const quoted = (value, quote) => `${quote}${value}${quote}`;
const gulpReplaceModule = (format, stream, quote = "'") =>
  Object.entries(DEP_MAPPING[format.target][format.module])
    .concat(format === MAIN_FORMAT ? [] : pkgNames.map((p) => [quoted(p, quote), quoted(mapDep(format, p), quote)]))
    .reduce((streamIn, [moduleName, replaceName]) => streamIn.pipe(gulpReplace(moduleName, replaceName)), stream);
const mapSources = (sourcePath) => path.basename(sourcePath);
const compileTypescript = ((cache) =>
  memoizeTask(cache, function compileTypescript(format, _done, type) {
    return gulpReplaceModule(
      format,
      addFast(format, gulp.src(globs.src), type === 'fast')
        .pipe(gulpFilter(['**', '!**/*.proto'].concat(smartContractPkgs.map((p) => `!packages/${p}/**/*`))))
        .pipe(gulpSourcemaps.init())
        .pipe(type === 'fast' ? format.fastProject() : format.project())
        .pipe(gulpSourcemaps.mapSources(mapSources))
        .pipe(gulpSourcemaps.write())
        .pipe(gulpReplace('rxjs/internal', `rxjs/${format.module === 'esm' ? '_esm2015/' : ''}internal`))
        .pipe(
          gulpRename((name) => {
            name.dirname = name.dirname
              .split(path.sep)
              .filter((dir) => dir !== 'src')
              .join(path.sep);
          }),
        )
        .pipe(gulpFilter(['**', '!packages/neo-one-developer-tools/*.js'])),
      format.module === 'esm' ? "'" : '"',
    ).pipe(gulp.dest(getDest(format)));
  }))({});

gulp.task('compileDeveloperToolsFrame', async () => {
  await execa('yarn', ['compile:developer-tools-frame'], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
});

const APP_ROOT_DIR = __dirname;

const compileDeveloperToolsBundle = ((cache) =>
  memoizeTask(cache, async function compileDeveloperToolsBundle(format) {
    const bundle = await rollup.rollup({
      input: path.resolve(APP_ROOT_DIR, 'packages', 'neo-one-developer-tools', 'src', 'index.ts'),
      external: ['resize-observer-polyfill'],
      plugins: [
        rollupString.string({
          include: '**/*.raw.js',
        }),
        rollupTypescript({
          cacheRoot: path.join('node_modules', '.cache', 'rts2', format.target, format.module),
          tsconfig: format.tsconfigESM,
          tsconfigOverride: {
            compilerOptions: {
              inlineSources: false,
              declaration: false,
            },
          },
          check: false,
        }),
      ],
    });

    await bundle.write({
      format: format.module,
      file: path.join(getDest(format), 'neo-one-developer-tools', 'index.js'),
    });
  }))({});

const buildAllNoDeveloperToolsBundle = ((cache) =>
  memoizeTask(cache, function buildAllNoDeveloperToolsBundle(format, done, type) {
    return gulp.parallel(
      ...[
        copyPkgFiles(format),
        copyPkg(format),
        copyTypes(format),
        copyTypescript(format),
        copyFiles(format),
        copyMetadata(format),
        copyRootPkg(format),
        copyRootTSConfig(format),
        format.browser ? undefined : compileTypescript(format, type),
        format === MAIN_FORMAT ? 'buildBin' : undefined,
        format === MAIN_FORMAT ? 'createBin' : undefined,
        format === MAIN_FORMAT ? 'copyBin' : undefined,
      ].filter((task) => task !== undefined),
    )(done);
  }))({});

const buildAll = ((cache) =>
  memoizeTask(cache, function buildAll(format, done, type) {
    return format.browser
      ? buildAllNoDeveloperToolsBundle(format, type)(done)
      : gulp.series(buildAllNoDeveloperToolsBundle(format, type), compileDeveloperToolsBundle(format))(done);
  }))({});

const install = ((cache) =>
  memoizeTask(cache, async function install(format) {
    await execa.shell('yarn install --non-interactive --no-progress --ignore-engines', {
      cwd: getDistBaseCWD(format),
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  }))({});

const publish = ((cache) =>
  memoizeTask(cache, async function publish(format) {
    await execa('yarn', ['lerna', 'exec', path.resolve(appRootDir.get(), 'scripts', 'try-publish')], {
      cwd: getDistBaseCWD(format),
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  }))({});

const rootPkg = { ...pkg, devDependencies: { ...pkg.devDependencies } };
delete rootPkg.devDependencies.husky;
delete rootPkg.husky;
const copyRootPkg = ((cache) =>
  memoizeTask(cache, async function copyRootPkg(format) {
    const filePath = path.resolve(getDistBase(format), 'package.json');
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(rootPkg, null, 2));
  }))({});

const copyRootTSConfig = ((cache) =>
  memoizeTask(cache, async function copyRootTSConfig(format) {
    const tsconfigContents = await fs.readFile(path.resolve(appRootDir.get(), 'tsconfig.json'), 'utf8');
    const tsconfig = JSON.parse(tsconfigContents);
    const suffix = format === MAIN_FORMAT ? '' : `-${format.target}-${format.module}`;
    tsconfig.compilerOptions.paths = {
      '@neo-one/ec-key': ['../@types/@neo-one/ec-key'],
      '@neo-one/boa': ['../@types/@neo-one/boa'],
      '@neo-one/csharp': ['../@types/@neo-one/csharp'],
      [`@neo-one/*${suffix}`]: ['./neo-one-*'],
      '*': ['../@types/*'],
    };
    const filePath = path.resolve(getDistBase(format), 'tsconfig.json');
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(tsconfig, null, 2));
  }))({});

const CLIENT_PACKAGES = new Set([
  '@neo-one/client',
  '@neo-one/client-common',
  '@neo-one/client-core',
  '@neo-one/developer-tools',
  '@neo-one/monitor',
  '@neo-one/utils',
  '@neo-one/client-switch',
  '@neo-one/server-http-client',
  '@neo-one/node-vm',
  '@neo-one/client-full-common',
  '@neo-one/node-core',
  '@neo-one/types',
]);

const CLIENT_FULL_PACKAGES = new Set(
  [...CLIENT_PACKAGES].concat(['@neo-one/client-full', '@neo-one/client-full-core']),
);

const CLIENT_BROWSERIFY = {
  'neo-one-client': CLIENT_PACKAGES,
  'neo-one-client-full': CLIENT_FULL_PACKAGES,
};

const webpackBrowserifyConfig = (externals, inputPath, outputPath) => ({
  entry: inputPath,
  output: {
    path: outputPath,
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  mode: 'production',
  node: {
    fs: 'empty',
  },
  externals,
  plugins: [
    new webpack.BannerPlugin({
      banner: `Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for("asyncIterator");`,
      raw: true,
    }),
  ],
});

const createPkgJSONMap = () => {
  const { pkgJSONs } = getPackageJSONs();

  return pkgJSONs.reduce(
    (acc, pkgJSON) => ({
      ...acc,
      [pkgJSON[1].name]: pkgJSON[1],
    }),
    {},
  );
};

const EXTERNALS_BLACKLIST = new Set(['through', 'wif']);

const getClientPkgDependencies = (pkgJSONMap, pkgs) => {
  const externals = new Set();
  pkgs.forEach((pkg) => {
    let dependencies = [];
    if (pkgJSONMap[pkg].dependencies !== undefined) {
      dependencies = pkgJSONMap[pkg].dependencies;
    }
    Object.keys(dependencies).forEach((name) => {
      if (!(name.includes('@neo-one') || name.includes('@types') || EXTERNALS_BLACKLIST.has(name))) {
        externals.add(name);
      }
    });
  });

  return [...externals];
};

const getPkgName = (pkgName) =>
  `@neo-one/${pkgName
    .split('-')
    .slice(2)
    .join('-')}`;

const copyBrowserifyTypesFiles = (inputPath, outputPath) => {
  const dirList = fs.readdirSync(inputPath);
  dirList.forEach((dirOrFile) => {
    const newInputPath = path.resolve(inputPath, dirOrFile);
    const newOutputPath = path.resolve(outputPath, dirOrFile);

    if (fs.lstatSync(newInputPath).isDirectory()) {
      copyBrowserifyTypesFiles(newInputPath, newOutputPath);
    } else if (dirOrFile.endsWith('.d.ts')) {
      const typesFile = fs.readFileSync(newInputPath, 'utf-8');
      fs.outputFileSync(
        newOutputPath,
        typesFile.replace(/(?<='@neo-one\/)(.*)(?=')/gm, (match) =>
          match.includes('ec-key') ? match : `${match}-browserify`,
        ),
      );
    }
  });
};

const copyBrowserifyTypes = ((cache) =>
  memoizeTask(cache, async function copyBrowserifyTypes(format) {
    if (format.browser) {
      const inputPath = path.resolve(DIST, 'neo-one', 'packages');
      const outputPath = getDest(format);

      const allPackages = await fs.readdir(inputPath);
      await Promise.all(
        allPackages.map(async (pkgName) => {
          if (CLIENT_FULL_PACKAGES.has(getPkgName(pkgName))) {
            copyBrowserifyTypesFiles(path.resolve(inputPath, pkgName), path.resolve(outputPath, pkgName));
          } else {
            await fs.remove(path.resolve(outputPath, pkgName));
          }
        }),
      );
    }
  }))({});

const bundleBrowserify = ((cache) =>
  memoizeTask(cache, async function bundleBrowserify(format) {
    if (format.browser) {
      const pkgJSONMap = createPkgJSONMap();
      const inputPkgPath = path.resolve(DIST, 'neo-one', 'packages');
      const outputPkgPath = getDest(format);

      await Promise.all(
        Object.entries(CLIENT_BROWSERIFY).map(async ([pkgName, neoOneDependencies]) => {
          const externals = getClientPkgDependencies(pkgJSONMap, neoOneDependencies);

          await new Promise((resolve, reject) =>
            webpack(
              webpackBrowserifyConfig(
                externals,
                path.resolve(inputPkgPath, pkgName),
                path.resolve(outputPkgPath, pkgName),
              ),
              (err, stats) => {
                if (err) {
                  reject(err);
                } else if (stats.hasErrors()) {
                  console.log(
                    stats.toString({
                      performance: false,
                      hash: false,
                      timings: true,
                      entrypoints: false,
                      chunkOrigins: false,
                      chunkModules: false,
                      colors: true,
                    }),
                  );
                  reject(new Error('Webpack bundling failed.'));
                } else {
                  resolve(stats);
                }
              },
            ),
          );
        }),
      );
    }
  }))({});

gulp.task(
  'browserify',
  gulp.parallel(
    FORMATS.filter((format) => format.browser).map((format) => copyBrowserifyTypes(format)),
    FORMATS.filter((format) => format.browser).map((format) => bundleBrowserify(format)),
  ),
);

const gulpBin = () =>
  gulpReplaceModule(MAIN_FORMAT, gulp.src(globs.bin)).pipe(
    gulpRename((parsedPath) => {
      parsedPath.dirname = parsedPath.dirname.slice(0, -'/src/bin'.length) + '/bin';
    }),
  );

const binProject = ts.createProject(MAIN_BIN_FORMAT.tsconfig, { typescript });
const binBanner = `#!/usr/bin/env node
require('source-map-support').install({ handleUncaughtExceptions: false, environment: 'node' });
const { defaultMetrics, metrics } = require('@neo-one/monitor');
metrics.setFactory(defaultMetrics);
`;
gulp.task('compileBin', () =>
  gulpBin()
    .pipe(gulpSourcemaps.init())
    .pipe(binProject())
    .pipe(gulpBanner(binBanner))
    .pipe(gulpSourcemaps.mapSources(mapSources))
    .pipe(gulpSourcemaps.write())
    .pipe(gulp.dest(getDest(MAIN_FORMAT))),
);
const bin = (name) => `#!/usr/bin/env node
const importLocal = require('import-local');

if (!importLocal(__filename)) {
  const execa = require('execa');
  const path = require('path');
  const semver = require('semver');

  let args = [];
  if (semver.satisfies(process.version, '8.x')) {
    args = ['--harmony-async-iteration'];
  } else if (semver.satisfies(process.version, '9.x')) {
    args = ['--harmony'];
  }

  const proc = execa('node', args.concat([path.resolve(__dirname, '${name}')]).concat(process.argv.slice(2)), {
    stdio: 'inherit',
    env: {
      NODE_NO_WARNINGS: '1',
    },
  });
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
  process.on('SIGINT', () => proc.kill('SIGINT'));
  process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
  process.on('SIGHUP', () => proc.kill('SIGHUP'));
  proc.on('exit', (code, signal) => {
    let exitCode = code;
    if (exitCode === null) {
      exitCode = signal === 'SIGINT' ? 0 : 1;
    }
    process.exit(exitCode);
  });
}
`;
gulp.task('createBin', () =>
  gulp
    .src(globs.bin)
    .pipe(
      through2.obj(function(file, enc, callback) {
        file.dirname = file.dirname.slice(0, -'/src/bin'.length) + '/bin';
        file.extname = '';
        file.contents = Buffer.from(bin(`${path.basename(file.basename, '.ts')}.js`), 'utf8');

        this.push(file);

        callback();
      }),
    )
    .pipe(gulp.dest(getDest(MAIN_FORMAT))),
);
gulp.task('copyBin', () => gulpBin().pipe(gulp.dest(getDest(MAIN_FORMAT))));
gulp.task('buildBin', gulp.parallel('compileBin', 'createBin', 'copyBin'));

gulp.task('clean', () => fs.remove(DIST));
gulp.task('copyPkg', gulp.parallel(FORMATS.map((format) => copyPkg(format))));
gulp.task('copyPkgFiles', gulp.parallel(FORMATS.map((format) => copyPkgFiles(format))));
gulp.task('copyTypes', gulp.parallel(FORMATS.map((format) => copyTypes(format))));
gulp.task('copyTypescript', gulp.parallel(FORMATS.map((format) => copyTypescript(format))));
gulp.task('copyMetadata', gulp.parallel(FORMATS.map((format) => copyMetadata(format))));
gulp.task('copyFiles', gulp.parallel(FORMATS.map((format) => copyFiles(format))));
gulp.task('copyRootPkg', gulp.parallel(FORMATS.map((format) => copyRootPkg(format))));
gulp.task('copyRootTSConfig', gulp.parallel(FORMATS.map((format) => copyRootTSConfig(format))));
gulp.task('compileDeveloperToolsBundle', gulp.parallel(FORMATS.map((format) => compileDeveloperToolsBundle(format))));
gulp.task('buildTypescript', gulp.parallel(FORMATS.map((format) => compileTypescript(format))));
gulp.task(
  'buildAll',
  gulp.series('compileDeveloperToolsFrame', gulp.parallel(FORMATS.map((format) => buildAll(format)))),
);
gulp.task('install', gulp.parallel(FORMATS.map((format) => install(format))));
gulp.task('publish', gulp.parallel(FORMATS.map((format) => publish(format))));

gulp.task('build', gulp.series('clean', 'buildAll', 'install', 'browserify'));

const buildE2ESeries = (type) =>
  gulp.series('compileDeveloperToolsFrame', buildAll(MAIN_FORMAT, type), install(MAIN_FORMAT));
gulp.task('buildE2E', gulp.series('clean', buildE2ESeries()));

const buildNodeSeries = (type) => gulp.series(buildAllNoDeveloperToolsBundle(MAIN_FORMAT, type), install(MAIN_FORMAT));
gulp.task('buildNode', gulp.series('clean', buildNodeSeries()));

gulp.task(
  'watch',
  gulp.series(buildE2ESeries('fast'), function startWatch() {
    noCache = true;
    gulp.watch(globs.originalSrc, compileTypescript(MAIN_FORMAT, 'fast'));
    gulp.watch(globs.bin, gulp.series('buildBin'));
  }),
);

gulp.task('prepareRelease', async () => {
  await execa(
    'yarn',
    [
      'lerna',
      'version',
      '--conventional-commits',
      '--npm-tag=latest',
      '--yes',
      '--message',
      'chore(release): publish',
      '--github-release',
    ],
    {
      stdio: ['ignore', 'inherit', 'inherit'],
    },
  );
});

gulp.task('test', async () => {
  await execa('yarn', ['test-ci'], { stdio: ['ignore', 'inherit', 'inherit'] });
});

gulp.task('e2e', async () => {
  await execa('yarn', ['e2e-ci'], { stdio: ['ignore', 'inherit', 'inherit'] });
});

gulp.task('release', gulp.series('test', 'build', 'e2e', 'prepareRelease', 'copyPkg', 'publish'));

gulp.task('fastRelease', gulp.series('build', 'prepareRelease', 'copyPkg', 'copyMetadata', 'copyPkgFiles', 'publish'));
