## Deploy apps with Docker

To deploy an app with docker using **app-server**, you can either install
**app-server** from npm inside your own docker image, or you can start your
image from `staticdeploy/app-server`, a (relatively) lightweight image with
**app-server** pre-installed.

### Example installing from npm

```Dockerfile
FROM node

# Build your app. For example you could do something like:
# COPY . .
# RUN npm install
# RUN npm run build

# Install app-server
RUN npm install --global @staticdeploy/app-server

# Set app-server as the image start command, starting with the necessary flags.
# For example if the build step produces a dist/ directory that you wish
# app-server to serve, you would do:
# CMD ["app-server", "--root=dist/"]
CMD ["app-server"]
```

### Example starting from staticdeploy/app-server

```Dockerfile
# First docker stage: build the app
FROM node

# Build your app. For example you could do something like:
# COPY . .
# RUN npm install
# RUN npm run build

# Second docker stage: copy artifacts into the staticdeploy/app-server image
FROM staticdeploy/app-server

# Copy artifacts from the previous stage (assuming they were produced in the
# /dist directory) into the /build directory of the image, the default directory
# served by app-server
COPY --from=0 /dist /build
```
