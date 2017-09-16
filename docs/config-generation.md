## How `window.APP_CONFIG` is generated

Given a set of environment variables:

- filter the ones whose name doesn't start with `APP_CONFIG_`
- strip the prefix `APP_CONFIG_` from the name of the remaining variables
- define the `window.APP_CONFIG` object using those key-value pairs

Example. Given the environment:

```sh
APP_CONFIG_KEY_0=VALUE_0
APP_CONFIG_KEY_1=VALUE_1
NON_PREFIXED_KEY=VALUE
```

the following `window.APP_CONFIG` is generated:

```js
window.APP_CONFIG = {
    "KEY_0": "VALUE_0",
    "KEY_1": "VALUE_1"
};
```
