const { configure, presets } = require('eslint-kit')

module.exports = configure({
  presets: [
    presets.node(),
    presets.prettier(),
    presets.typescript(),
    presets.alias(),
  ],
  extend: {
    overrides: [
      {
        files: ['*.ts'],
        rules: {
          '@typescript-eslint/no-unnecessary-condition': 'off',
        },
      },
    ],
  },
})
