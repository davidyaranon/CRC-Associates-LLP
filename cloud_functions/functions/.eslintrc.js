module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "object-curly-spacing": "off",
    "quotes": "off",
    "require-jsdoc": "off",
    "max-len": "off",
    "prefer-const": "off",
    "padded-blocks": "off",
    "no-trailing-spaces": "off",
    "no-multiple-empty-lines": "off",
    "comma-dangle": "off",
    "arrow-parens": "off",
    "spaced-comment": "off",
  },
};
