import Camera from "@arcgis/core/Camera";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import WebScene from "@arcgis/core/WebScene";
import { initView } from "./utils";

export const ZURICH_KAFERBERG = "173e0afe6073499b95c5eaec7728035a";
export const ZURICH_CITY = "71187d3fc8f54619ad2141294ee1ea07";
export const HIKING_TRAILS = "8037d7b07bd2402d83faba39a60c76af";
export const MANHATTAN = "9a542f6755274436985617a462ffdf44";
export const ESRI_OFFICE_BSL = "94379f34cee14049a9273ab91ac1743f";
export const WORLD_CAPITALS = "c025297bbf004abc863773858add4058";
export const SHADOW_CAST = "f2220db76c6448b4be8083d19ef4cf8d";

export function initSanFrancisco() {
  const buildings = new SceneLayer({
    opacity: 1,
    popupEnabled: false,
    renderer: new SimpleRenderer({
      symbol: new MeshSymbol3D({
        symbolLayers: [new FillSymbol3DLayer({ material: { color: [150, 150, 150], colorMixMode: "replace" } })],
      }),
    }),
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/SF_BLDG_WSL1/SceneServer/layers/0",
  });

  const footprints = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/SF_BLDG_WSL1/FeatureServer/0",
  });

  const view = initView();
  view.camera = new Camera({
    position: {
      spatialReference: new SpatialReference({ wkid: 102100 }),
      x: -13624530.501136787,
      y: 4550280.841056057,
      z: 1807.2933060163632,
    },
    heading: 278.95767768173954,
    tilt: 24.162441184380782,
  });

  const scene = view.map as WebScene;
  scene.basemap = "dark-gray-vector" as any; // Rely on auto-casting
  scene.ground = "world-elevation" as any; // Rely on auto-casting
  scene.addMany([buildings, footprints]);

  return { view, buildings, footprints };
}
