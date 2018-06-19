## 2.1.0 (June 19, 2018)

Deprecations:

- option `--fallbackResource` renamed `--fallbackAssetPath` (to use the same
  name as [StaticDeploy](https://github.com/staticdeploy/staticdeploy))

Fixes:

- fix typo in `--root` option description

## 2.0.0 (June 16, 2018)

Breaking changes:

- asset matching algorithm changed:

  - when requesting `/path`, if both files `/path.html` and `/path/index.html`
    exist, `/path.html` is served (used to be the contrary)
  - some paths that responded 404 now respond the fallback resource (issue #3)

- log format changed (from Standard Apache Common Log Format to JSON)

- removed `dev-config-server` bin (but added `@staticdeploy/app-config` as
  dependency, which provides the same `dev-config-server` bin)

- removed exported function `getConfigScriptHandler` (if needed, should now be
  imported from `@staticdeploy/app-config`)

Deprecations:

- option `--index` renamed `--fallbackResource`
- option `--baseUrl` renamed `--basePath`

Fixes:

- serve fallback resource even when path contains dots (issue #3)
- 301 to `/baseUrl/` on GET `/baseUrl` (issue #1)

Features:

- add option `--configKeyPrefix`

## 1.1.1 (September 21, 2017)

Fixes:

- publish `bin` folder to npm

## 1.1.0 (September 21, 2017)

Features:

- `dev-config-server` binary to serve configuration during development

## 1.0.2 (September 16, 2017)

Publish useful package metadata to npm.

## 1.0.1 (September 16, 2017)

First version published to npm.

## 1.0.0 (September 16, 2017)

Initial release. Not published on npm due to package access issues.
