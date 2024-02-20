module.exports = (path, options) => {
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => {
      // This is a workaround for a situation where certain packages do not
      // provide exports that are not compatible with Jest 28.
      // See also: https://jestjs.io/docs/upgrading-to-jest28#packagejson-exports
      // and this comment for analysis and the workaround we adopt here:
      // https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149
      //
      // The way this works is to force these packages to fall back to the
      // CommonJS export "main" property by deleting their "export" properties.
      //
      // It seems this can go away if either:
      // 1) the packages change how they provide exports
      // 2) Jest is updated to be fully ESM
      if (pkg.name === 'nanoid' || pkg.name === 'uuid') {
        delete pkg.exports
        delete pkg.module
      }
      return pkg
    }
  })
}
