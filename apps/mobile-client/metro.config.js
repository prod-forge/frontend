// Expo monorepo setup: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Workspace packages (core, design-tokens) live outside the app folder.
config.watchFolders = [workspaceRoot];
// The app's own node_modules win over the hoisted ones. Hierarchical lookup stays on (expo-doctor
// requires it since SDK 58); a single hoisted react copy is guaranteed by aligning web and mobile versions.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// design-tokens publishes its JS entry only through the package.json "exports" map.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
