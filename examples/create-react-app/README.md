# create-react-app app example

Example of using **app-server** with a trivial
[**create-react-app**](https://github.com/facebook/create-react-app) app.

## Run the example in development mode

```sh
git clone https://github.com/staticdeploy/app-server.git
cd app-server/examples/create-react-app
yarn install
# Start the development server
yarn start
```

Open the app at http://localhost:3000 and see the `Hello world!` greeting.
Change the value of the variable defined in `public/index.html` and see that the
greeting target has changed.

### What happens in the example

`yarn start` simply starts **create-react-app**'s development server.

When the app is loaded:

1.  the `#app-config` script in the app's `index.html` defines the variable
    `window.APP_CONFIG`
2.  the appropriate greeting is rendered

## Run the example in production mode with Docker

```sh
git clone https://github.com/staticdeploy/app-server.git
cd app-server/examples/create-react-app
# Build the app Docker image
docker build -t app-server-example .
# Run the image passing in the necessary configuration
docker run --rm --init -p 3000:80 -e APP_CONFIG_TARGET=world app-server-example
```

Open the app at http://localhost:3000 and see the `Hello world!` greeting. Stop
the container and restart it passing in a different value for the
`APP_CONFIG_TARGET` variable. Re-open the app and see that the greeting target
has changed.

### What happens in the example

The `docker build ...` command builds the app docker image, using the
`staticdeploy/app-server:cra-builder` and `staticdeploy/app-server:cra-runtime`
base images which respectively:

- build the app into a static bundle
- setup**app-server** to serve the bundle

When the image is run with `docker run ...`, `app-server`:

1.  starts serving the app using StaticDeploy's serving algorithm, that includes
    features such as:
    1. using a fallback asset for requests to non-existing assets
    2. allowing the user to use non-canonical paths to request assets (e.g.
       `/foo/index.js` instead of `/index.js`)
    3. injecting the app configuration in the served html files
    4. specifying custom headers for assets

When the app is loaded:

1.  the `#app-config` script in the app's `index.html` is evaluated
2.  the content of the script defines the variable `window.APP_CONFIG`
3.  the appropriate greeting is rendered
