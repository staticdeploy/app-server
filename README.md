[![npm version](https://img.shields.io/npm/v/@staticdeploy/app-server.svg)](https://www.npmjs.com/package/@staticdeploy/app-server)
[![build status](https://travis-ci.org/staticdeploy/app-server.svg?branch=master)](https://travis-ci.org/staticdeploy/app-server)
[![coverage status](https://codecov.io/github/staticdeploy/app-server/coverage.svg?branch=master)](https://codecov.io/github/staticdeploy/app-server?branch=master)
[![dependency status](https://david-dm.org/staticdeploy/app-server.svg)](https://david-dm.org/staticdeploy/app-server)
[![devDependency status](https://david-dm.org/staticdeploy/app-server/dev-status.svg)](https://david-dm.org/staticdeploy/app-server#info=devDependencies)

# app-server

A tool to serve and apply runtime configuration to static apps.

This tool was created to allow
[create-react-app](https://github.com/facebook/create-react-app) apps to be
configured at runtime (serve-time) via environment variables, making them easily
"dockerizable". It can however be used to serve and configure any static app.

### Install

```
yarn add -D @staticdeploy/app-server
```

### Guides

- [usage with create-react-app](docs/usage-with-cra.md)
- [deploy create-react-app apps with Docker](docs/deploy-cra-apps-with-docker.md)

### Additional documentation

- [how requests are routed](docs/requests-routing.md)
- [how `window.APP_CONFIG` is generated](docs/config-generation.md)
- [app-server configuration options](docs/app-server-configuration-options.md)
