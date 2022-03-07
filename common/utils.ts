import Camera from "@arcgis/core/Camera";
import { when } from "@arcgis/core/core/reactiveUtils";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-alert";
import "@esri/calcite-components/dist/components/calcite-loader";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { HELSINKI_FIELDS } from "./scenes";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

const Reveal = (parent as any).Reveal as RevealStatic | null;

export function initView(itemId?: string, camera?: Camera) {
  const container = document.getElementById("viewDiv") as HTMLDivElement;

  const viewProps: __esri.SceneViewProperties = {
    container,
    map: itemId ? new WebScene({ portalItem: { id: itemId } }) : new WebScene({ basemap: "topo" }),
    qualityProfile: "high",
    popup: { defaultPopupTemplateEnabled: false },
  };

  const view = new SceneView(camera ? { ...viewProps, camera } : viewProps);

  showSpinnerUntilLoaded(view);

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}

function showSpinnerUntilLoaded(view: SceneView): void {
  const container = view.container;

  container.classList.add("loading");

  const loader = container.appendChild(document.createElement("calcite-loader"));
  loader.type = "indeterminate";
  loader.active = true;

  when(
    () => !view.groundView.updating,
    () => {
      container.classList.remove("loading");
      loader.remove();
    },
    { once: true }
  );
}

export function onInit(title: string, cb: () => void) {
  if (getCurrentSlide()?.getAttribute("data-slideId") === title) {
    cb();
  }
}

export function onFragment(id: string, cb: () => void) {
  if (!Reveal) {
    return;
  }

  const run = () => {
    if (getCurrentFragmentId() === id) {
      cb();
    }
  };

  Reveal.addEventListener("fragmenthidden", run);
  Reveal.addEventListener("fragmentshown", run);
  run();
}

export function onPlayClick(name: string, cb: () => void): void {
  getCurrentSlide()
    ?.querySelector(`[data-fragment-id="${name}"] > .play`)
    ?.addEventListener("click", cb);
}

export function getCurrentSlide(): HTMLElement | null {
  return Reveal?.getCurrentSlide() as HTMLElement;
}

export function getCurrentFragment(): HTMLElement | null {
  return getCurrentSlide()?.querySelector(".current-fragment") ?? null;
}

function getCurrentFragmentId(): string | null {
  return getCurrentFragment()?.getAttribute("data-fragment-id") ?? null;
}

export function setHeader(header: string, selector: string = ".header"): void {
  const headerElement = getCurrentSlide()?.querySelector(selector);
  if (!headerElement) {
    return;
  }

  headerElement.textContent = header;
}

export function showAlert(msg: string): void {
  const alertElement = document.createElement("calcite-alert");
  alertElement.active = true;

  const msgElement = alertElement.appendChild(document.createElement("div"));
  msgElement.slot = "message";
  msgElement.textContent = msg;

  document.body.appendChild(alertElement);
}

export function addOAuthSupport(): void {
  IdentityManager.registerOAuthInfos([
    new OAuthInfo({
      appId: "pZzd4uJ0gZddupQh",
      popup: true,
      popupCallbackUrl: `${document.location.origin}/oauth-callback-api.html`,
    }),
  ]);

  (window as any).setOAuthResponseHash = (responseHash: string) => {
    IdentityManager.setOAuthResponseHash(responseHash);
  };
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new Error("AbortError");
  }
}

export function throwIfNotAbortError(e: any): void {
  if (e?.message !== "AbortError") {
    throw e;
  }
}

export async function getLayerFromView(layerName: string, view: SceneView): Promise<SceneLayer> {
  await (view.map as any).load();
  return view.map.layers.find((l) => l.title === layerName) as SceneLayer;
}

export function applySolarAreaRenderer(layer: SceneLayer) {
  layer.renderer = {
    type: "simple",
    symbol: {
      type: "mesh-3d",
      symbolLayers: [
        {
          type: "fill",
          material: { color: "white", colorMixMode: "replace" },
          edges: {
            type: "solid",
            color: [50, 50, 50, 0.5],
          },
        },
      ],
    },
    visualVariables: [
      {
        type: "color",
        field: HELSINKI_FIELDS.solarAreaField,
        legendOptions: {
          title: "Solar-Suitable Area (m<sup>2</sup>)",
        },
        stops: [
          { value: 200, color: "#406f8a", label: "< 100 m<sup>2</sup>" },
          { value: 1000, color: "#ffe23b", label: "> 1000 m<sup>2</sup>" },
        ],
        binSize: 200,
      },
    ],
  } as any;
}

export function addEditablePoint(view: SceneView, onUpdate: (pointGraphic: Graphic) => void) {
  const graphicsLayer = new GraphicsLayer({
    // elevationInfo: { mode: "on-the-ground" },
    title: "Sketch GraphicsLayer",
  });
  const point = {
    type: "point", // autocasts as new Point()
    spatialReference: { latestWkid: 3857, wkid: 102100 },
    x: 2775690.9496367406,
    y: 8434900.987816326,
    z: 50,
  };
  const markerSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2,
    },
  };
  const pointGraphic = new Graphic({
    geometry: point,
    symbol: markerSymbol,
  });
  graphicsLayer.add(pointGraphic);

  let sketchVM = new SketchViewModel({
    layer: graphicsLayer,
    view: view,
    defaultCreateOptions: {
      hasZ: true, // default value
    },
    defaultUpdateOptions: {
      enableZ: true, // default value
    },
  });

  view.on("click", async (e) => {
    const hitTestResult = await view.hitTest(e);
    if (hitTestResult.results.find((r) => r.graphic === pointGraphic)) {
      sketchVM.update(pointGraphic);
    }
  });

  sketchVM.on("update", () => onUpdate(pointGraphic));

  return { graphicsLayer, pointGraphic };
}
