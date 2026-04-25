/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'website',
        'client',
        'server',
        'shared',
        'utils',
        'ci',
        'config',
        'docs',
        'deps',
        'adr',
        'release',
      ],
    ],
  },
}
