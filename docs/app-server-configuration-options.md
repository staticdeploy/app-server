## app-server configuration options

The **app-server** binary takes the following configuration options:

- `--root` (env `APP_SERVER_ROOT`): root diretory to serve, defaults to `build`
- `--fallbackResource` (env `APP_SERVER_FALLBACK_RESOURCE`): fallback resource
  to serve when the requested path doesn't match any asset, defaults to
  `/index.html`
- `--selector` (env `APP_SERVER_SELECTOR`): selector for the script element to
  inject config into, defaults to `script#app-config`
- `--configKeyPrefix` (env `APP_SERVER_CONFIG_KEY_PREFIX`): prefix of the
  environment variables to use for configuration, defaults to `APP_CONFIG_`
- `--baseUrl` (env `APP_SERVER_BASE_URL`): website base url, defaults to `/`
- `--port` (env `APP_SERVER_PORT`): port to listen on, defaults to `3000`
