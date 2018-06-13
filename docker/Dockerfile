FROM node:8-alpine

WORKDIR /workspace

# Copy files
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src/
COPY bin ./bin/

# Install dependencies
RUN yarn install --frozen-lockfile && \
    # Compile code
    yarn compile && \
    # Remove dev dependencies and other unnecessary files
    yarn install --production && \
    yarn cache clean && \
    rm -r yarn.lock tsconfig.json src

# Configure healthcheck. We consider the container healthy if requesting the
# base url of the server returns a non-error code (2xx, 3xx).
#
# APP_SERVER_BASE_URL can either:
#
#   - be undefined
#   - have or not have a leading slash
#   - have or not have a trailing slash
#
# In those cases, the url constructed below becomes:
#
#   - http://localhost/
#   - http://localhost/base or http://localhost/base (no difference)
#   - http://localhost/base or http://localhost/base/
#
# In all cases app-server should respond with either a 200 or a 301, passing the
# healthcheck
HEALTHCHECK CMD curl -f http://localhost/${APP_SERVER_BASE_URL#/} || exit 1

# Configure environment and listening port
ENV NODE_ENV production
ENV APP_SERVER_PORT 80
EXPOSE 80

# Set start command
CMD [ "yarn", "start" ]
