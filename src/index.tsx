import create from "zustand/vanilla";

type MapAssetTypes = {
  link: { type?: string; rel?: string; id: string; url: string };
  script: { id: string; url: string };
};

type Asset<T extends "link" | "script"> = {
  type: T;
  values: MapAssetTypes[T];
};

type Props = {
  assets: (Asset<"link"> | Asset<"script">)[];
  onError?: (error: Return) => void;
};

type State = "loading" | "ready" | "error";

type Return = {
  state: "ready" | "error";
  asset: Asset<"link"> | Asset<"script">;
};

type AssetStore = {
  assets: {
    [id: string]: (Asset<"link"> | Asset<"script">) & { state: State };
  };
  states: { [id: string]: State };
};

const initialState = {
  assets: {},
  states: {},
};

const { getState, setState, subscribe } = create<AssetStore>(
  () => initialState
);

export default function useAssetsLoader(): (props: Props) => Promise<{
  result: Return[];
  status: "ready";
}> {
  return ({ onError, assets }: Props) =>
    new Promise(async (resolve) => {
      const readyScripts = assets.filter(({ values: { id, url } }) => {
        const previouse = getState().assets[url];
        return (
          previouse && previouse.values.id === id && previouse.state === "ready"
        );
      });
      const scriptPromises: Promise<Return>[] = assets.map((asset) =>
        loadAsset(asset)
      );

      if (readyScripts.length === assets.length) {
        return resolve({
          result:
            assets.map((asset) => ({
              asset,
              state: "ready",
            })) || [],
          status: "ready",
        });
      }

      const result = await Promise.all(scriptPromises).catch(
        (error: Return) => {
          assets.forEach(({ type, values: { id, url } }) => {
            const isScript = type === "script";
            const documentTarget = isScript ? document.body : document.head;
            const element = document.querySelector(`#${id}`);
            const { [url]: _, ...assets } = getState().assets;

            if (element) {
              documentTarget.removeChild(element);
              setState({
                assets,
                states: { ...getState().states, [id]: "error" },
              });
            }
          });
          return [error];
        }
      );

      if (result.find((script) => script.state === "error")) {
        return onError && onError(result[0]);
      }

      return resolve({ result, status: "ready" });
    });
}

function loadAsset(asset: Asset<"link"> | Asset<"script">): Promise<Return> {
  let unsubscribe: undefined | (() => void);
  let rel: string, type: string;
  const { id, url } = asset.values;
  const { type: assetType } = asset;
  const loadingStates = ["ready", "error"];
  const prevElement = getState().assets[url];
  const loadingState = getState().states[id];

  if (asset.type === "link") {
    rel = asset.values.rel || "stylesheet";
    type = asset.values.type || "text/css";
  }

  return new Promise<Return>((resolve, reject) => {
    const promiseCallback = ({ state, asset }: Return) => {
      if (state === "ready") resolve({ state, asset });

      if (state === "error") reject({ state, asset });
    };
    const isScript = assetType === "script";
    const element = isScript
      ? document.createElement("script")
      : document.createElement("link");
    const handler = (event: Event) => {
      const state = event.type === "load" ? "ready" : "error";
      element.setAttribute("data-status", state);
      setState({
        assets: {
          ...getState().assets,
          [url]: { ...asset, state },
        },
        states: { ...getState().states, [id]: state },
      });
    };
    const cleanUp = () => {
      unsubscribe && unsubscribe();
      unsubscribe = undefined;
      element.removeEventListener("load", handler);
      element.removeEventListener("error", handler);
    };
    const addAsset = (add: boolean) => {
      if (add) {
        const target = isScript ? document.body : document.head;
        setState({
          assets: {
            ...getState().assets,
            [url]: { ...asset, state: getState().states[id] },
          },
        });
        if (element instanceof HTMLScriptElement) {
          element.src = url;
          element.async = false;
          element.defer = true;
        } else {
          element.rel = rel;
          element.type = type;
          element.href = url;
        }

        element.setAttribute("data-status", "loading");
        element.id = id;
        target.appendChild(element);
        element.addEventListener("load", handler);
        element.addEventListener("error", handler);
      } else {
        (async () => {
          const check = () =>
            new Promise((resolve) => {
              setTimeout(
                () =>
                  resolve(
                    loadingStates.includes(
                      getState().assets[url]?.state || ""
                    ) && getState().states[id] === "loading"
                  ),
                1
              );
            });
          let result = null;
          let counter = 5080;
          while (!result && counter > 0) {
            counter--;
            result = await check();
          }
          setState({
            assets: {
              ...getState().assets,
              [url]: {
                ...asset,
                state: getState().assets[url]?.state || "error",
              },
            },
          });
        })();
      }
    };

    unsubscribe = subscribe(
      (asset) => {
        const state = asset?.state || getState().states[id];

        if (!getState().assets[url] && getState().states[id] === "loading") {
          addAsset(true);
        }

        if (state && !(state === "ready" || state === "error")) return;

        setState({
          states: { ...getState().states, [id]: state },
        });

        cleanUp();
        promiseCallback({ state, asset });
      },
      () => getState().assets[url]
    );
    setTimeout(() => {
      unsubscribe && cleanUp();
    }, 5888);

    if (loadingState === "loading") return;

    if (prevElement && loadingStates.includes(loadingState)) {
      promiseCallback({ state: loadingState, asset });
    }
    setState({
      states: {
        ...getState().states,
        [id]: "loading",
      },
    });
    addAsset(!prevElement || false);
  });
}
