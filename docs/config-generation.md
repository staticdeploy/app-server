## How `window.APP_CONFIG` is generated

> Note: the configuration is generated and injected using
> [staticdeploy/app-config](https://github.com/staticdeploy/app-config/)

Given a set of environment variables and a prefix (default `APP_CONFIG_`):

- filter the ones whose name doesn't start with the prefix
- strip the prefix from the name of the remaining variables
- define the `window.APP_CONFIG` object using those key-value pairs

### Example

Given the environment:

```sh
APP_CONFIG_KEY_0=VALUE_0
APP_CONFIG_KEY_1=VALUE_1
NON_PREFIXED_KEY=VALUE
```

the following `window.APP_CONFIG` is generated:

```js
window.APP_CONFIG = {
  KEY_0: "VALUE_0",
  KEY_1: "VALUE_1"
};
```
