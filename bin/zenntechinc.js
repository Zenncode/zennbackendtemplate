#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const pkg = require('../package.json');
const templateRoot = path.join(__dirname, '..', 'templates', 'backend');
const ignoredTemplateEntries = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.nyc_output',
  '.git',
  '.DS_Store',
  'tsconfig.build.tsbuildinfo',
  'dev.out.log',
  'dev.err.log',
  'dev.runtime.out.log',
  'dev.runtime.err.log',
]);

function printHelp() {
  console.log(`
zenntechinc CLI

Usage:
  zenntechinc new <project-name> [--skip-install]
  zenntechinc --help
  zenntechinc --version

Examples:
  zenntechinc new my-api
  zenntechinc new my-api --skip-install
`);
}

function isValidProjectName(name) {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

function toPackageName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

function ensureTemplateExists() {
  if (!fs.existsSync(templateRoot)) {
    console.error('Template folder not found inside package.');
    process.exit(1);
  }
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (ignoredTemplateEntries.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const outputName = entry.name === '_gitignore' ? '.gitignore' : entry.name;
    const destinationPath = path.join(destination, outputName);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function updateGeneratedPackageJson(targetDir, projectName) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = toPackageName(projectName);
  packageJson.private = true;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function ensureDotEnv(targetDir) {
  const envPath = path.join(targetDir, '.env');
  const envExamplePath = path.join(targetDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function runNpm(args, spawnOptions) {
  if (process.platform !== 'win32') {
    return spawnSync(getNpmCommand(), args, spawnOptions);
  }

  // On some Windows setups, spawning npm.cmd directly with spawnSync throws EINVAL.
  // Use cmd.exe explicitly and keep args fixed (not user input).
  const comspec = process.env.ComSpec || 'cmd.exe';
  const commandLine = ['npm', ...args].join(' ');
  return spawnSync(comspec, ['/d', '/s', '/c', commandLine], spawnOptions);
}

function runInstall(targetDir) {
  const spawnOptions = {
    cwd: targetDir,
    stdio: 'inherit',
  };
  const installResult = runNpm(['install', '--ignore-scripts'], {
    ...spawnOptions,
  });

  if (installResult.error || installResult.status !== 0) {
    console.error('\nDependency installation failed.');
    if (installResult.error) {
      console.error(`Reason: ${installResult.error.message}`);
    }
    process.exit(installResult.status || 1);
  }

  // Keep install resilient in restricted environments, then try prepare non-blocking.
  const prepareResult = runNpm(['run', 'prepare', '--if-present'], {
    ...spawnOptions,
  });

  if (prepareResult.error || prepareResult.status !== 0) {
    console.warn('\nDependencies installed, but prepare step was skipped.');
    console.warn('You can run `npm run prepare` later (typically after `git init`).');
  }
}

function createProject(projectName, options) {
  ensureTemplateExists();

  if (!isValidProjectName(projectName)) {
    console.error(
      'Invalid project name. Use only letters, numbers, dash, and underscore.',
    );
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(`Target folder already exists and is not empty: ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  copyDirectory(templateRoot, targetDir);
  updateGeneratedPackageJson(targetDir, projectName);
  ensureDotEnv(targetDir);

  if (!options.skipInstall) {
    console.log('\nInstalling dependencies...');
    runInstall(targetDir);
  }

  console.log(`\nProject created: ${projectName}`);
  console.log(`Location: ${targetDir}`);
  console.log('\nNext steps:');
  console.log(`  cd ${projectName}`);
  if (options.skipInstall) {
    console.log('  npm install');
  }
  console.log('  # Ensure MongoDB is running or update MONGODB_URI in .env');
  console.log('  # Example with Docker: docker compose up -d mongo');
  console.log('  npm run dev');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(pkg.version);
    return;
  }

  if (command === 'new') {
    const projectName = args[1];
    const options = {
      skipInstall: args.includes('--skip-install') || args.includes('-s'),
    };

    if (!projectName) {
      console.error('Missing project name.\n');
      printHelp();
      process.exit(1);
    }

    createProject(projectName, options);
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exit(1);
}

main();
