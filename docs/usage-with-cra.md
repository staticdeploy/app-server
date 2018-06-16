## Usage with create-react-app

### [Example project](../examples/create-react-app/)

### How-to

First:

- add the following `<script>` to your `public/index.html`:

  ```html
  <script id="app-config" src="http://localhost:3456/app-config.js"></script>
  ```

- modify the `start` npm script:

  ```json
  "start": "dev-config-server & react-scripts start"
  ```

  > Note: you can use `npm-run-all` or `concurrently` to better handle
  > concurrently running processes in npm scripts

- access the config variable in your code:
  ```js
  console.log(window.APP_CONFIG.MY_VAR);
  ```

Then:

#### In development

- define configuration in the `.env` file:

  ```sh
  APP_CONFIG_MY_VAR=my_val
  ```

- start the development server with `yarn start`

#### In production

- build your app with `yarn build`

- run `app-server` defining configuration via environment variables:
  ```sh
  env APP_CONFIG_MY_VAR=my_val app-server
  ```

### How it works

#### In development

`dev-config-server` - a CLI tool provided by
[staticdeploy/app-config](https://github.com/staticdeploy/app-config/),
dependency of app-server - starts a server listening on port `3456`. Reading
environment variables defined in the `.env` file, it generates a javascript file
and serves it at `/app-config.js`. The file defines the `window.APP_CONFIG`
global variable ([how it's generated](config-generation.md)).

`react-scripts` starts the development server of the app.

When the app is loaded in the browser, the `#app-config` script in `index.html`
loads `/app-config.js` defining `window.APP_CONFIG`. The variable can then be
accessed by the app code.

#### In production

`app-server` starts a server listening on port `3000`, serving files under the
`build` directory. It also generates - from environment variables - the
javascript file defining `window.APP_CONFIG`. Instead of serving it at
`/app-config.js` though, the server injects it directly as content of the
`#app-config` script in `index.html` (removing the script's `src` attribute).

When the app is loaded in the browser, the `#app-config` script is evaluated,
defining `window.APP_CONFIG` that can then be accessed by the app code.
