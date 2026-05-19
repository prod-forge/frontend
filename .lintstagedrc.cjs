module.exports = {
  '*.md': ['prettier --write'],
  '*.ts': [() => 'tsc --noEmit'],
  '*.{ts,json}': ['prettier --write', 'eslint --fix'],
};
