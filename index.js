/**
 * App entry point (Expo managed workflow, SDK 58).
 *
 * `registerRootComponent` is the Expo equivalent of `AppRegistry.registerComponent`
 * and wraps the root in the React Native renderer setup Expo expects.
 */

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
