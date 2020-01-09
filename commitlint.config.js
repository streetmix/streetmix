module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [
      1,
      'always',
      [
        'lower-case',
        'pascal-case' // allows React components as a scope
      ]
    ]
  }
}
