// @ts-check
import AreaMeasurementAnalysis from "@arcgis/core/analysis/AreaMeasurementAnalysis";
import Extent from "@arcgis/core/geometry/Extent";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneView from "@arcgis/core/views/SceneView";
import { initSanFrancisco } from "../scenes";
import { onInit, throwIfAborted, throwIfNotAbortError } from "../utils";

let view: SceneView;
let buildings: SceneLayer;
let footprints: FeatureLayer;

onInit("area-measurement-analysis", () => {
  const data = initSanFrancisco();
  view = data.view;
  buildings = data.buildings;
  footprints = data.footprints;

  let abortController: AbortController | null = null;

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

      const analysis = new AreaMeasurementAnalysis({
        geometry: footprint,
        unit: "square-feet",
      });

      (view as any).analyses.removeAll();
      (view as any).analyses.add(analysis);
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
});

async function getFootprint(building: Graphic, signal: AbortSignal): Promise<Polygon | null> {
  const query = footprints.createQuery();
  query.objectIds = [building.getObjectId()];
  query.outFields = ["*"];
  query.multipatchOption = "xyFootprint";
  query.returnGeometry = true;

  const result = await footprints.queryFeatures(query);
  throwIfAborted(signal);

  return result.features.length === 0 ? null : (result.features[0].geometry as Polygon);
}

async function getExtent(building: Graphic, signal: AbortSignal): Promise<Extent | null> {
  const buildingsLV = await view.whenLayerView(buildings);
  throwIfAborted(signal);

  const extentResult = await buildingsLV.queryExtent({
    objectIds: [building.getObjectId()],
    returnGeometry: true,
  });
  throwIfAborted(signal);

  return extentResult.extent;
}
