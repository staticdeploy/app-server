# create-react-app app example

Example of using `app-server` with a trivial `create-react-app` app.

## Run the example in development mode

```sh
git clone https://github.com/staticdeploy/app-server.git
cd app-server/examples/create-react-app
yarn install
# Start the development server
yarn start
```

Open the app at http://localhost:3000 and see the `Hello world!` greeting. Then
stop the process, change the value of the variable defined in `.env` and restart
the development server. Re-open the app and see that the greeting target has
changed.

### What happens in the example

`yarn start` starts - in parallel - `create-react-app`'s development server and
`app-server`'s `dev-config-server`.

When started, `dev-config-server`:

1.  generates from the `.env` file a javascript script defining the global
    variable `window.APP_CONFIG`
2.  serves the script at `http://localhost:3456/app-config.js`

When the app is loaded:

1.  the `#app-config` script in the app's `index.html` loads and evaluates
    `/app-config.js`
2.  `app-config.js` defines the variable `window.APP_CONFIG`
3.  the appropriate greeting is rendered

## Run the example in production mode with Docker

```sh
git clone https://github.com/staticdeploy/app-server.git
cd app-server/examples/create-react-app
# Build the app Docker image
docker build -t app-server-example .
# Run the image passing in the necessary configuration
docker run -p 3000:80 -e APP_CONFIG_TARGET=world app-server-example
```

Open the app at http://localhost:3000 and see the `Hello world!` greeting. Then
stop the container and restart it passing in a different value for the
`APP_CONFIG_TARGET` variable. Re-open the app and see that the greeting target
has changed.

### What happens in the example

The `docker build ...` command builds the app docker image, using the
`staticdeploy/app-server:cra-builder` and `staticdeploy/app-server:cra-runtime`
base images which respectively build the app into a static bundle and setup
`app-server` to serve the built app.

When the image is run with `docker run ...`, `app-server`:

1.  starts serving the app
2.  generates from environment variables a javascript script defining the global
    variable `window.APP_CONFIG`,
3.  injects the script as content of the `#app-config` script in the app's
    `index.html`

When the app is loaded:

1.  the `#app-config` script in the app's `index.html` is evaluated
2.  the content of the script defines the variable `window.APP_CONFIG`
3.  the appropriate greeting is rendered
