#!/usr/bin/env node
/**
 * One-command local development: Firebase emulators + seed + Expo run.
 *
 * Usage:
 *   npm run dev:android
 *   npm run dev:ios
 *
 * - Reuses already-running emulators; starts them only when needed and stops
 *   them again on exit.
 * - Seeds the sample curriculum (idempotent).
 * - Builds/installs the dev client and starts Metro via `expo run:*`.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.argv[2];

const PROJECT_ID = 'demo-amazigh-learning';
const FIRESTORE_PORT = 8080;
const AUTH_PORT = 9099;
const EMULATOR_START_TIMEOUT_MS = 90_000;

if (platform !== 'android' && platform !== 'ios') {
  console.error('Usage: node scripts/dev.mjs <android|ios>');
  process.exit(1);
}

const children = [];
let stopping = false;

function spawnChild(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    // Own process group (POSIX) so Ctrl+C / cleanup can stop emulators
    // together with their Java child processes.
    detached: process.platform !== 'win32',
    ...options,
  });
  children.push(child);
  child.on('error', error => {
    console.error(`Failed to start ${command}: ${error.message}`);
  });
  return child;
}

function waitForExit(child) {
  return new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
}

/** Runs a probe command, returning its combined output or null if missing. */
function probe(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) {
    return null;
  }
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/** Fail fast with actionable messages instead of obscure toolchain errors. */
function preflight() {
  const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
  if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
    fail(
      `Node.js >= 22.13 is required (found ${process.versions.node}). ` +
        'See "Prerequisites" in README.md.',
    );
  }

  // The Firebase emulators (and the seed script) run on the JVM.
  const javaVersion = probe('java', ['-version']);
  if (javaVersion === null) {
    fail(
      'Java is not installed — the Firebase emulators need it. See "Prerequisites" in README.md.',
    );
  }
  const javaMajor = Number(javaVersion.match(/version "(\d+)/)?.[1] ?? 0);
  if (javaMajor < 11) {
    fail(
      `Java 11+ is required for the Firebase emulators (found ${javaVersion
        .split('\n')[0]
        .trim()}).`,
    );
  }

  if (platform === 'android') {
    const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
    if (!sdk) {
      fail(
        'ANDROID_HOME is not set. Point it at your Android SDK ' +
          '(e.g. export ANDROID_HOME="$HOME/Library/Android/sdk" on macOS).',
      );
    }
    if (!existsSync(path.join(sdk, 'platform-tools', 'adb'))) {
      fail(
        `No adb found under ${sdk}/platform-tools — check your Android SDK installation.`,
      );
    }
  }

  if (platform === 'ios') {
    if (process.platform !== 'darwin') {
      fail(
        'dev:ios requires macOS with Xcode. Use dev:android or run iOS on a Mac.',
      );
    }
    if (probe('xcodebuild', ['-version']) === null) {
      fail(
        'Xcode is not installed (xcodebuild not found). Install Xcode and accept its license.',
      );
    }
  }
}

/** Any HTTP response (even 4xx) means the emulator is up; only a refused
 * connection means it is down. */
async function emulatorReachable(port) {
  try {
    await fetch(`http://localhost:${port}`, {
      signal: AbortSignal.timeout(2000),
    });
    return true;
  } catch {
    return false;
  }
}

async function emulatorsRunning() {
  const [firestore, auth] = await Promise.all([
    emulatorReachable(FIRESTORE_PORT),
    emulatorReachable(AUTH_PORT),
  ]);
  return firestore && auth;
}

async function waitForEmulators() {
  const deadline = Date.now() + EMULATOR_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await emulatorsRunning()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function ensureEmulators() {
  if (await emulatorsRunning()) {
    console.log('Firebase emulators already running — reusing them.');
    return;
  }
  console.log('Starting Firebase emulators (firestore + auth)...');
  spawnChild('npx', [
    'firebase',
    'emulators:start',
    '--only',
    'firestore,auth',
    '--project',
    PROJECT_ID,
  ]);
  if (!(await waitForEmulators())) {
    throw new Error(
      `Firebase emulators did not become ready within ${
        EMULATOR_START_TIMEOUT_MS / 1000
      }s.`,
    );
  }
}

async function seed() {
  console.log('Seeding emulator data...');
  const code = await waitForExit(
    spawnChild('node', ['scripts/seed-emulator.mjs'], {
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: `localhost:${FIRESTORE_PORT}`,
        GCLOUD_PROJECT: PROJECT_ID,
      },
    }),
  );
  if (code !== 0) {
    throw new Error(`Seed script failed with exit code ${code}.`);
  }
}

function killChild(child) {
  if (child.exitCode !== null || child.killed) {
    return;
  }
  try {
    if (process.platform === 'win32') {
      child.kill();
    } else {
      // Negative pid = whole process group (npx → firebase → java).
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch {
    try {
      child.kill();
    } catch {
      // already gone
    }
  }
}

function cleanup(exitCode) {
  if (stopping) {
    return;
  }
  stopping = true;
  for (const child of children) {
    killChild(child);
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => cleanup(130));
process.on('SIGTERM', () => cleanup(143));

async function main() {
  preflight();

  console.log(`\nAmazigh Learning — dev:${platform} (project ${PROJECT_ID})\n`);
  await ensureEmulators();
  await seed();

  if (await emulatorReachable(8081)) {
    console.log(
      'Port 8081 is already in use — Expo will offer another port. ' +
        'If the app cannot connect, open the dev menu and enter the shown URL.',
    );
  }

  const env = {
    ...process.env,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  };
  if (platform === 'ios') {
    // CocoaPods fails on non-UTF-8 locales; default to UTF-8 for the build.
    env.LANG = env.LANG ?? 'en_US.UTF-8';
    env.LC_ALL = env.LC_ALL ?? 'en_US.UTF-8';
  }

  console.log(
    'When the app opens, tap "Continue as guest (dev)" on the Welcome screen ' +
      'to enter with the seeded curriculum.',
  );

  const code = await waitForExit(
    spawnChild('npx', ['expo', `run:${platform}`], { env }),
  );
  cleanup(code);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  cleanup(1);
});
