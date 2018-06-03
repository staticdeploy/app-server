## `app-server` configuration options

The `app-server` binary takes the following configuration options:

- `--root` (env `APP_SERVER_ROOT`): root diretory to serve, defaults to `build`
- `--index` (env `APP_SERVER_INDEX`): index file, defaults to `index.html`
- `--selector` (env `APP_SERVER_SELECTOR`): selector for the script element to
  inject config into, defaults to `script#app-config`
- `--baseUrl` (env `APP_SERVER_BASE_URL`): website base url, defaults to `/`
- `--port` (env `APP_SERVER_PORT`): port to listen on, defaults to `3000`
