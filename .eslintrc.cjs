module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    "jest/globals": true
  },
  plugins: ["@typescript-eslint/eslint-plugin", "react-hooks", "jest", "import", "unused-imports"],
  extends: ["airbnb", "plugin:import/typescript", "plugin:import/errors", "plugin:import/warnings", "prettier"],
  globals: {
    JSX: true,
    globalThis: true,
    NodeJS: true
  },
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: "."
  },
  rules: {
    "func-style": ["error", "expression"],
    "prefer-regex-literals": "off",
    "react/no-unused-prop-types": "off",
    "no-restricted-exports": "off",
    "no-unsafe-optional-chaining": "off",
    "react/no-unstable-nested-components": "off",
    "react/jsx-no-useless-fragment": "off",
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "import/no-extraneous-dependencies": "off",
    "react/react-in-jsx-scope": "off",
    camelcase: "off",
    "import/order": [
      "error",
      {
        pathGroups: [
          { pattern: "react", group: "external", position: "before" },
          { pattern: "@demo/**", group: "external", position: "after" },
          { pattern: "@widget/**", group: "external", position: "after" },
          { pattern: "@assets/**", group: "external", position: "after" },
          { pattern: "@utils/**", group: "external", position: "after" },
          { pattern: "@helpers/**", group: "external", position: "after" },
          { pattern: "@components/**", group: "external", position: "after" },
          { pattern: "@styles/**", group: "external", position: "after" },
          { pattern: "@interfaces/**", group: "external", position: "after" }
        ],
        pathGroupsExcludedImportTypes: ["builtin", "type"],
        groups: ["builtin", "external", "internal", "parent", "sibling", "object", "type", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc" }
      }
    ],
    "jsx-a11y/label-has-associated-control": [
      2,
      {
        required: {
          some: ["nesting", "id"]
        }
      }
    ],
    "react/jsx-indent": "off",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/newline-after-import": ["error", { count: 1 }],
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "import/no-cycle": "error",
    "import/export": "error",
    "import/prefer-default-export": "off",
    "import/no-duplicates": "error",
    "no-irregular-whitespace": "warn",
    "react/no-access-state-in-setstate": "warn",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "lines-between-class-members": "off",
    "no-nested-ternary": "off",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true
      }
    ],
    "no-shadow": "off",
    "no-unused-vars": "off",
    "no-array-constructor": "off",
    "object-curly-spacing": ["error", "always"],
    semi: ["error", "never"],
    "no-multiple-empty-lines": ["error"],
    "no-restricted-imports": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false
      }
    ],
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "@typescript-eslint/array-type": ["error", { default: "generic" }],
    "@typescript-eslint/no-shadow": ["warn", { ignoreFunctionTypeParameterNameValueShadow: true }],
    "@typescript-eslint/prefer-interface": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["../../../**/*"],
            message: "Please use alias paths instead"
          }
        ]
      }
    ],
    "react/destructuring-assignment": "off",
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx", ".ts", ".jsx"]
      }
    ],
    "react/jsx-one-expression-per-line": "off",
    "react/prop-types": "off",
    "react/prefer-stateless-function": "off",
    "react/no-danger": "off",
    "react/jsx-wrap-multilines": "off",
    "react/jsx-props-no-spreading": "off",
    "no-use-before-define": "off",
    "arrow-body-style": "off",
    "react/jsx-fragments": "off",
    "react/jsx-curly-newline": "off",
    "react/require-default-props": "off",
    "react/state-in-constructor": "off",
    "react/no-array-index-key": "off",
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function"
      }
    ],
    "react/jsx-no-constructed-context-values": "off",
    "react-hooks/rules-of-hooks": "error"
  },
  settings: {
    react: {
      version: "detect",
      runtime: "automatic"
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-undef": "off"
      }
    },
    {
      files: ["vite.config.ts"],
      parserOptions: {
        project: "./tsconfig.node.json"
      }
    }
  ]
}
