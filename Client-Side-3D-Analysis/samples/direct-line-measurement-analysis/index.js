// @ts-check
import DirectLineMeasurement from "@arcgis/core/analysis/DirectLineMeasurement.js";
import Point from "@arcgis/core/geometry/Point.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import { initView, onInit, throwIfAborted } from "../utils.js";
import { WORLD_CAPITALS } from "../scenes.js";

let view;

onInit("direct-line-measurement-analysis", () => {
  view = initView(WORLD_CAPITALS);

  const palmSprings = new Point({
    x: -116.563645,
    y: 33.772349,
    spatialReference: SpatialReference.WGS84,
  });

  let abortController = null;

  view.on("click", async (event) => {
    abortController?.abort();
    const { signal } = (abortController = new AbortController());

    const { results } = await view.hitTest(event);
    throwIfAborted(signal);

    const result = results.find((r) => r.graphic);
    if (!result) {
      return;
    }

    const analysis = new DirectLineMeasurement({
      startPoint: result.graphic.geometry,
      endPoint: palmSprings,
    });

    view.analyses.removeAll();
    view.analyses.add(analysis);
  });
});
