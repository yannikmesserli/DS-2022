// @ts-check
import Camera from "@arcgis/core/Camera";
import AreaMeasurement from "@arcgis/core/analysis/AreaMeasurement";
import Polygon from "@arcgis/core/geometry/Polygon";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import Graphic from "@arcgis/core/Graphic";
import Extent from "@arcgis/core/geometry/Extent";
import { initView, onInit, throwIfAborted, throwIfNotAbortError } from "../utils";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

let view;

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

onInit("area-measurement-analysis", () => {
  view = initView();
  initScene();

  let abortController = null;

  view.on("click", async (e) => {
    abortController?.abort();
    const { signal } = (abortController = new AbortController());

    try {
      const { results } = await view.hitTest(e, { include: [buildings] });
      throwIfAborted(signal);

      const building = results.find((r) => r.graphic)?.graphic;
      if (!building) {
        return;
      }

      const [footprint, extent] = await Promise.all([getFootprint(building, signal), getExtent(building, signal)]);
      throwIfAborted(signal);

      if (!footprint || !extent) {
        return;
      }

      // Place the measurement above the building
      footprint.rings = footprint.rings.map((ring) => ring.map(([x, y]) => [x, y, extent.zmax + 10]));
      footprint.hasZ = true;

      const analysis = new AreaMeasurement({
        geometry: footprint,
        unit: "square-feet",
      });

      view.analyses.removeAll();
      view.analyses.add(analysis);
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
});

function initScene() {
  view.map.basemap = "dark-gray-vector";
  view.map.ground = "world-elevation";
  view.map.addMany([buildings, footprints]);

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
}

async function getFootprint(building, signal) {
  const query = footprints.createQuery();
  query.objectIds = [building.getObjectId()];
  query.outFields = ["*"];
  query.multipatchOption = "xyFootprint";
  query.returnGeometry = true;

  const result = await footprints.queryFeatures(query);
  throwIfAborted(signal);

  return result.features.length === 0 ? null : result.features[0].geometry;
}

async function getExtent(building, signal) {
  const buildingsLV = await view.whenLayerView(buildings);
  throwIfAborted(signal);

  const extentResult = await buildingsLV.queryExtent({
    objectIds: [building.getObjectId()],
    returnGeometry: true,
  });
  throwIfAborted(signal);

  return extentResult.extent;
}
