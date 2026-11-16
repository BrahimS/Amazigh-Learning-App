import { Platform } from 'react-native';

import { config, environment } from '@/config';

export const FIRESTORE_EMULATOR_PORT = 8080;
export const AUTH_EMULATOR_PORT = 9099;

export interface EmulatorEndpoint {
  hostname: string;
  port: number;
}

/**
 * Whether the app should talk to the local Firebase emulators. Development
 * builds use them by default (set EXPO_PUBLIC_USE_EMULATORS=false to opt
 * out); staging and production always use real Firebase.
 */
export function shouldUseEmulators(): boolean {
  return environment === 'development' && config.emulators.useEmulators;
}

/**
 * Address of the machine running `firebase emulators:start`, as seen from the
 * app: the Android emulator reaches the host through 10.0.2.2, while the iOS
 * simulator shares the host's localhost. For a physical device, set
 * EXPO_PUBLIC_*_EMULATOR_HOST to the machine's LAN IP instead.
 */
function devMachineHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

function endpoint(
  configuredHost: string,
  defaultPort: number,
): EmulatorEndpoint {
  const fallback = `${devMachineHost()}:${defaultPort}`;
  const [hostname, port] = (configuredHost || fallback).split(':');
  return { hostname, port: Number(port) || defaultPort };
}

export function firestoreEmulatorEndpoint(): EmulatorEndpoint {
  return endpoint(config.emulators.firestoreHost, FIRESTORE_EMULATOR_PORT);
}

export function authEmulatorEndpoint(): EmulatorEndpoint {
  return endpoint(config.emulators.authHost, AUTH_EMULATOR_PORT);
}
