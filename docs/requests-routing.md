## How requests are routed

**app-server** was created to serve Single Page Applications (SPA), and its
routing algorithm was designed to solve the problems that arise when SPAs do
client-side routing using the
[HTML5 history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API),
i.e. when they change their path in the browser URL.

When **app-server** receives a GET request for a certain path, it tries to match
the request to one of the assets it's tasked to serve, even if the requested
path is not strictly equal to the asset path. If it can't match the request to
any asset, it serves the asset designated to be the fallback asset (typically
`/index.html`). We'll explain the routing algorithm with an example.

### Example

Let's assume **app-server** is serving the following directory:

```sh
/
├── index.html
└── js/
    └── index.js
```

#### Falling back to a "catch all" asset

When a request is made for `/` or for `/index.html`, naturally **app-server**
responds with the `/index.html` file. When a request is made instead for
`/some/path/`, **app-server** tries to match it to one of the files in the
directory. `/some/path/` doesn't look anything like `/index.html` or
`/js/index.js`, so **app-server** determines that no file matches the requested
path, and serves the fallback asset, which happens to be `/index.html`.

This behaviour solves the problem of a user reloading a Single Page Application
when the browser URL has been modified by client-side routing: instead of
getting a 404 because the reloaded URL is not `/`, the browser receives the
`index.html` and the app can restart without issues.

#### Serving files with a "similar" path

When a request is made for `/js/index.js`, naturally **app-server** responds
with the `/js/index.js` file. But when a request is made for
`/some/path/js/index.js`, instead of responding with a 404 or with the fallback
asset, **app-server** sees that the requested path looks a lot like
`/js/index.js`, assumes that the requester wanted that file, and responds with a
301, redirecting to the file's _canonical path_, i.e. `/js/index.js`.

This behaviour saves the developer of the app from having to statically specify
(in the code or at build time) the _exact_ paths of the app's assets. In the
example above, in the `index.html` file the developer can just point to the
`index.js` file with a relative URL: `./js/index.js`. Now even when
`/index.html` is loaded - as a fallback - from `/some/path/`, `./js/index.js`
will be resolved by the browser to `/some/path/js/index.js`, which leads to the
correct file.

This is especially useful when the app is deployed _not-at-the-root_ of a
domain, e.g. `example.com/base-path/`. In this case, if the developer had to
statically specify the _exact_ paths, they'd have to know beforehand (or at most
at build time) what the base path of the deployed app would be, an information
they might not have or that might change over time, requiring the app to be
rebuilt.
