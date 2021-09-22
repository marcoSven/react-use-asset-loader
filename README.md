# react-use-asset-loader

> react hook to load assets

[![NPM](https://img.shields.io/npm/v/react-use-asset-loader.svg)](https://www.npmjs.com/package/react-use-asset-loader) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-asset-loader
```

## Usage

```tsx
import * as React from "react";

import useLoadAssets from "react-use-asset-loader";

const Example = () => {
  const loadAssets = useLoadAssets();
  return (
    <button
      onClick={() =>
        loadAssets({
          assets: [
            {
              type: "link",
              values: {
                url: "https://sample.css",
                id: "sample-css",
                rel: "stylesheet",
                type: "text/css",
              },
            },
            {
              type: "script",
              values: {
                url: "https://sample.js",
                id: "sample-js",
              },
            },
          ],
        })
      }
    >
      Test
    </button>
  );
};
```

## License

MIT © [marcoSven](https://github.com/marcoSven)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
