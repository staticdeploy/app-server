## 2.0.0 (June 16, 2018)

Breaking changes:

- asset matching algorithm changed:

  - when requesting `/path`, if both files `/path.html` and `/path/index.html`
    exist, `/path.html` is served (used to be the contrary)
  - some paths that responded 404 now respond the fallback resource (issue #3)

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

Initial release. Not published on npm due to packege access issues.
