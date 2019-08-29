[![npm version](https://img.shields.io/npm/v/@staticdeploy/app-server.svg)](https://www.npmjs.com/package/@staticdeploy/app-server)
[![build status](https://img.shields.io/circleci/project/github/staticdeploy/app-server.svg)](https://circleci.com/gh/staticdeploy/app-server)
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
- [deploy generic static apps with Docker](docs/deploy-apps-with-docker.md)
- [serving assets with custom headers](docs/serving-assets-with-custom-headers.md)

### Reference documentation

- [app-server config options](docs/app-server-config-options.md)
- [how requests are routed](docs/requests-routing.md)
