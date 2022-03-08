import Camera from "@arcgis/core/Camera";
import { when } from "@arcgis/core/core/reactiveUtils";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-alert";
import "@esri/calcite-components/dist/components/calcite-loader";
import { HELSINKI_FIELDS } from "./scenes";

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

  (view as any).pixelRatio = 1;

  showSpinnerUntilLoaded(view);

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
      popupCallbackUrl: `${import.meta.env.BASE_URL}oauth-callback-api.html`,
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

const yearClasses = [
  {
    minYear: 1500,
    maxYear: 1899,
    color: "#bd0026",
    label: "<1900",
  },
  {
    minYear: 1900,
    maxYear: 1924,
    color: "#f03b20",
    label: "1900 - 1924",
  },
  {
    minYear: 1925,
    maxYear: 1949,
    color: "#fd8d3c",
    label: "1925 - 1949",
  },
  {
    minYear: 1950,
    maxYear: 1974,
    color: "#feb24c",
    label: "1951 - 1974",
  },
  {
    minYear: 1975,
    maxYear: 1999,
    color: "#fed976",
    label: "1975 - 1999",
  },
  {
    minYear: 2000,
    maxYear: 2020,
    color: "#ffffb2",
    label: "2000 - 2020",
  },
];

export function applyYearRenderer(layer: SceneLayer) {
  const classBreakInfos = yearClasses.map((year) => {
    return {
      minValue: year.minYear,
      maxValue: year.maxYear,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [
          {
            type: "fill",
            material: {
              color: year.color,
              colorMixMode: "replace",
            },
            edges: {
              type: "solid",
              color: [50, 50, 50, 0.5],
            },
          },
        ],
      },
    };
  });

  layer.renderer = new ClassBreaksRenderer({
    field: HELSINKI_FIELDS.yearField,
    defaultSymbol: {
      type: "mesh-3d",
      symbolLayers: [
        {
          type: "fill",
          material: {
            color: "white",
            colorMixMode: "replace",
          },
          edges: {
            type: "solid",
            color: [50, 50, 50, 0.5],
          },
        },
      ],
    } as any,
    classBreakInfos: classBreakInfos as any,
  });
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

export const point = new Point({
  spatialReference: { latestWkid: 3857, wkid: 102100 } as any,
  x: 2775690.9496367406,
  y: 8434900.987816326,
  z: 50,
});

export function addEditablePoint(view: SceneView, onUpdate: (pointGraphic: Graphic) => void) {
  const graphicsLayer = new GraphicsLayer({
    // elevationInfo: { mode: "on-the-ground" },
    title: "Sketch GraphicsLayer",
  });
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

// setup statistic definition
export const sumLabel = "sum_area";
export const statDefinition: StatisticDefinition[] = [
  new StatisticDefinition({
    onStatisticField: HELSINKI_FIELDS.solarAreaField,
    outStatisticFieldName: sumLabel,
    statisticType: "sum",
  }),
];

export function addSumArea(view: SceneView) {
  const sumContainer = document.getElementById("sumContainer") as HTMLDivElement;
  sumContainer.style.display = "block";
  sumContainer.style.backgroundColor = "white";
  sumContainer.style.padding = "5px";
  view.ui.add("sumContainer", "top-right");
}
