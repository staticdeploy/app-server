ARG DOCKER_TAG
FROM staticdeploy/app-server:$DOCKER_TAG

# Copy files from cra-runtime stage
ONBUILD COPY --from=0 /app/build /build
