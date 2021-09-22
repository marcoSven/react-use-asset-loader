import React from "react";

import useLoadAssets from "react-use-asset-loader";

const App = () => {
  const loadAssets = useLoadAssets();
  return (
    <button
      onClick={async () => {
        await loadAssets({
          assets: [
            {
              type: "link",
              values: {
                url: process.env.PUBLIC_URL + "/sample.css",
                id: "sample-css",
                rel: "stylesheet",
                type: "text/css",
              },
            },
            {
              type: "script",
              values: {
                url: "https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js",
                id: "sample-js",
              },
            },
          ],
        });
        if (window.JSConfetti) {
          const jsConfetti = new window.JSConfetti();

          jsConfetti.addConfetti();
        }
      }}
    >
      Test
    </button>
  );
};
export default App;
