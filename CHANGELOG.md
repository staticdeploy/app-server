## 4.0.0 (August 29, 2019)

Features:

- add option `--headers` to allow attaching custom headers to responses
- add option `--fallbackStatusCode` to change the status code with which the
  fallback asset is served
- add option `--configuration` to allow passing the JSON configuration object
  directly (not just via env variables)
- add option `--config` to allow passing config options via config file

Breaking changes:

- remove deprecated options `--index`, `--fallbackResource`, and `--baseUrl`
- remove option `--selector` (as StaticDeploy only supports `script#app-config`)
- option `--configKeyPrefix` renamed `--configurationKeyPrefix` (to avoid
  confusion between the terms `config`, referring to the config options taken by
  **app-server**, and `configuration`, the JSON configuration object inject into
  static apps)
- use StaticDeploy core module for implementing routing logic (before the logic
  was more or less a copy-paste of StaticDeploy's code)

Fixes:

- remove `x-powered-by` header from responses

## 3.0.0 (April 4, 2019)

Breaking changes:

- update docker images to `node:lts` (10)

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
