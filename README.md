[![npm version](https://img.shields.io/npm/v/@staticdeploy/app-server.svg)](https://www.npmjs.com/package/@staticdeploy/app-server)
[![build status](https://travis-ci.org/staticdeploy/app-server.svg?branch=master)](https://travis-ci.org/staticdeploy/app-server)
[![coverage status](https://codecov.io/github/staticdeploy/app-server/coverage.svg?branch=master)](https://codecov.io/github/staticdeploy/app-server?branch=master)
[![dependency status](https://david-dm.org/staticdeploy/app-server.svg)](https://david-dm.org/staticdeploy/app-server)
[![devDependency status](https://david-dm.org/staticdeploy/app-server/dev-status.svg)](https://david-dm.org/staticdeploy/app-server#info=devDependencies)

# app-server

A tool to serve and apply runtime configuration to static apps.

This tool was created to allow
[create-react-app](https://github.com/facebookincubator/create-react-app)
apps to be configured at runtime (serve-time) via environment variables,
making them easily "dockerizable". It can however be used to serve and
configure any static app.

### Install

```
npm i --save-dev @staticdeploy/app-server
```

### Quickstart

- add the following `<script>` to your `index.html`:
  ```html
  <script id="app-config">
      window.APP_CONFIG={
          MY_VAR: "default value for development"
      };
  </script>
  ```
  When serving the file, `app-server` will inject the runtime configuration into
  the element.

- access the config variables in your code:
  ```js
  console.log(window.APP_CONFIG.MY_VAR);
  ```

- start the server setting configuration variables:
  ```sh
  env APP_CONFIG_MY_VAR=value app-server
  ```

### Documentation

- [how `window.APP_CONFIG` is generated](docs/config-generation.md)
- [how the config script is injected into index.hmtl](docs/config-injection.md)
- [how to dynamically set `window.APP_CONFIG` in development](docs/dynamic-config-in-dev.md)
- [server configuration options](docs/server-configuration-options.md)
