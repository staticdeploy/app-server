## Usage with create-react-app

### [Example project](../examples/create-react-app/)

### How-to

First:

- add the following `<script>` to your `public/index.html`:
  ```html
  <script id="app-config">
    window.APP_CONFIG = {
      /* Your development configuration here */
      MY_VAR: "my_val"
    };
  </script>
  ```
- access the config variable in your code:
  ```js
  console.log(window.APP_CONFIG.MY_VAR);
  ```

Then:

#### In development

- define your development configuration in the `app-config` script as seen above
- start the development server with `yarn start`

#### In production

- build your app with `yarn build`
- run **app-server** defining configuration via environment variables:
  ```sh
  env APP_CONFIG_MY_VAR=my_val app-server
  ```

### How it works

#### In development

**react-scripts** starts the development server of the app.

When the app is loaded in the browser, the `#app-config` script in `index.html`
defines `window.APP_CONFIG`. The variable can then be accessed by the app code.

#### In production

**app-server** starts a static server for files under the `build` directory. It
also generates - from environment variables, command line options, or a
configuration file - the javascript snippet defining `window.APP_CONFIG`, and
injects it as content of the `#app-config` script in `index.html`, replacing the
development configuration.

When the app is loaded in the browser, the `#app-config` script is evaluated,
defining `window.APP_CONFIG` that can then be accessed by the app code.
