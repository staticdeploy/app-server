## How the config script is injected into index.hmtl

The config script is injected:

- in the html file specified by the `index` configuration option located in the
  directory specified by the `root` configuration option
- as content of the html element matching the CSS selector specified by the
  `selector` configuration option

The injector also removes the `src` attribute (if present) from the target
element. This ensures that the content of the script doesn't get ignored, and
allows the `src` attribute to be used in development.
