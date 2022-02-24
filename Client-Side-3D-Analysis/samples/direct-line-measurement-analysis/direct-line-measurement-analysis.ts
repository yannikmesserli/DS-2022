// @ts-check
import DirectLineMeasurementAnalysis from "@arcgis/core/analysis/DirectLineMeasurementAnalysis";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import SceneView from "@arcgis/core/views/SceneView";
import { WORLD_CAPITALS } from "../scenes";
import { initView, onInit, throwIfAborted } from "../utils";

let view: SceneView;

onInit("direct-line-measurement-analysis", () => {
  view = initView(WORLD_CAPITALS);

  const palmSprings = new Point({
    x: -116.563645,
    y: 33.772349,
    spatialReference: SpatialReference.WGS84,
  });

  let abortController: AbortController | null = null;

  view.on("click", async (event) => {
    abortController?.abort();
    const { signal } = (abortController = new AbortController());

    const { results } = await view.hitTest(event);
    throwIfAborted(signal);

    const result = results.find((r) => r.graphic);
    if (!result) {
      return;
    }

    const analysis = new DirectLineMeasurementAnalysis({
      startPoint: result.graphic.geometry,
      endPoint: palmSprings,
    });

    (view as any).analyses.removeAll();
    (view as any).analyses.add(analysis);
  });
});
