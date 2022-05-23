ARG BUILDPLATFORM
FROM --platform=${BUILDPLATFORM} node:lts-slim

# Install app-server into directory /app-server
WORKDIR /app-server

# Copy files
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src/
COPY bin ./bin/

# Install dependencies
RUN yarn install --frozen-lockfile && \
    # Install curl for performing healthchecks
    apt-get update && apt install -y curl && \
    # Compile code
    yarn compile && \
    # Remove dev dependencies and other unnecessary files
    yarn install --production && \
    yarn cache clean && \
    rm -r yarn.lock tsconfig.json src

# Configure healthcheck. We consider the container healthy if requesting /
# something is returned
HEALTHCHECK CMD curl http://localhost/ || exit 1

# Configure environment and listening port
ENV NODE_ENV production
ENV APP_SERVER_PORT 80
EXPOSE 80

# Return to default WORKDIR
WORKDIR /

# Set start command
CMD [ "node", "/app-server/bin/app-server.js" ]
