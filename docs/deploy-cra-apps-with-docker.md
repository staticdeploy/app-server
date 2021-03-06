## Deploy create-react-app apps with Docker

Assuming you've set up your project as described in the
[usage with create-react-app guide](usage-with-cra.md), then all you need to
build a docker image for building and serving your app is using the following
`Dockerfile`:

```Dockerfile
FROM staticdeploy/app-server:vX.Y.Z-cra-builder
FROM staticdeploy/app-server:vX.Y.Z-cra-runtime
```

The first `FROM` instruction will run the `ONBUILD` instructions of the
`:vX.Y.Z-cra-builder` image, which will install dependencies with **npm** (or
**yarn** if your project has a `yarn.lock`) and build the app by running the
`build` npm script.

The second `FROM` instruction will copy the built app into the (relatively)
small `:vX.Y.Z-cra-runtime` image where **app-server** is installed and
configured to serve the app.

You can then run your app image passing in configuration via environment
variables:

```sh
docker run -e APP_CONFIG_MY_VAR=my_val my-app-image
```
