module.exports = {
  "*.{ts,tsx}": [() => "tsc --skipLibCheck --noEmit", "prettier --write", "eslint --fix"],
  "*.{scss,css}": ["prettier --write", "npx stylelint --fix"]
}
