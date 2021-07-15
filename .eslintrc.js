module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  plugins: [
    'node',
  ],
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
    'class-methods-use-this': 'off',
    'func-names': ['error', 'as-needed'],
    'arrow-body-style': ['error', 'as-needed'],
    'no-restricted-globals': ['error', 'off'],
    'default-case': 'off',
  },
};
