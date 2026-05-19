'use strict';

const fs = require('fs');
const path = require('path');

const getTscCommands = (files) => {
  const cwd = process.cwd();
  const pkgDirs = new Set();

  for (const file of files) {
    const rel = path.relative(cwd, file);
    const m = rel.match(/^((?:packages|apps)\/[^/]+)/);
    if (m) pkgDirs.add(m[1]);
  }

  const cmds = [];
  for (const dir of pkgDirs) {
    for (const cfg of ['tsconfig.json', 'tsconfig.node.json']) {
      if (fs.existsSync(path.join(cwd, dir, cfg))) {
        cmds.push(`tsc --noEmit -p ${dir}/${cfg}`);
      }
    }
  }

  return cmds;
};

module.exports = {
  '*.md': ['prettier --write'],
  '*.{ts,tsx,json}': ['prettier --write', 'eslint --fix'],
  '*.{ts,tsx}': [getTscCommands],
};
