module.exports = {
  arrowParens: "avoid",
  bracketSameLine: false,
  bracketSpacing: true,
  htmlWhitespaceSensitivity: "strict",
  insertPragma: false,
  jsxSingleQuote: false,
  printWidth: 80,
  proseWrap: "preserve",
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  jsonRecursiveSort: true,
  overrides: [
    {
      files: "meta.json",
      options: {
        jsonRecursiveSort: false,
      },
    },
  ],
};
