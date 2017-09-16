## How to dynamically set `window.APP_CONFIG` in development

In the [quickstart](../README.md#Quickstart) `window.APP_CONFIG` was statically
set for development inside the `app-config` script. There are situations though
where we need it to be set dynamically, using for instance environment variables
set in the local environment or listed in a `.env` file.

We can do so by loading the config script content from a (local) url, instead of
embedding it directly:

```html
<!--
    Note: when running `app-server` to serve the app, the src attribute is
    automatically stripped from the element so it won't shadow the injected
    content
-->
<script id="app-config" src="http://localhost:3456/app-config.js"></script>
```

Now we just need to start a local server serving that file:

```js
// Loads environment variables from .env
require("dotenv").config();
const express = require("express");
const { getConfigScriptHandler } = require("@staticdeploy/app-server");

express()
    // getConfigScriptHandler returns an express route handler serving the
    // config script generated from environment variables
    .get("/app-config.js", getConfigScriptHandler())
    .listen("3456");
```

If you're also using
[@staticdeploy/mock-server](https://github.com/staticdeploy/mock-server), just
pass it the `--serve-config` flag and `mock-server` will generate and serve
`/app-config.js` for you.
