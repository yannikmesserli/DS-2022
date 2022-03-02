// @ts-check
import DirectLineMeasurementAnalysis from "@arcgis/core/analysis/DirectLineMeasurementAnalysis";
import Color from "@arcgis/core/Color";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import SceneView from "@arcgis/core/views/SceneView";
import { WORLD_CAPITALS } from "../../../common/scenes";
import { initView, onInit, throwIfAborted, throwIfNotAbortError } from "../../../common/utils";

let view: SceneView;

onInit("direct-line-measurement-analysis", () => {
  view = initView(WORLD_CAPITALS);

  view.highlightOptions.color = new Color([255, 255, 0, 1]);

  const palmSprings = new Point({
    x: -116.563645,
    y: 33.772349,
    spatialReference: SpatialReference.WGS84,
  });

  let clickAbortController: AbortController | null = null;

  view.on("click", async (event) => {
    clickAbortController?.abort();
    const { signal } = (clickAbortController = new AbortController());

    try {
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
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });

  let highlightAbortController: AbortController | null = null;
  let highlightHandle: IHandle | null = null;

  view.on("pointer-move", async (e) => {
    highlightAbortController?.abort();
    const { signal } = (highlightAbortController = new AbortController());

    try {
      const { results } = await view.hitTest(e);
      throwIfAborted(signal);

      highlightHandle?.remove();
      highlightHandle = null;

      const graphic = results.length > 0 ? results[0].graphic : null;
      if (graphic) {
        const lv = (await view.whenLayerView(graphic.layer)) as any;
        throwIfAborted(signal);

        highlightHandle = lv.highlight(graphic);
      }
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
});
