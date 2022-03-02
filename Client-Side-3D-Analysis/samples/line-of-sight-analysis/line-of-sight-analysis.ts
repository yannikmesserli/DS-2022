import LineOfSightAnalysis from "@arcgis/core/analysis/LineOfSightAnalysis";
import LineOfSightAnalysisObserver from "@arcgis/core/analysis/LineOfSightAnalysisObserver";
import LineOfSightAnalysisTarget from "@arcgis/core/analysis/LineOfSightAnalysisTarget";
import Collection from "@arcgis/core/core/Collection";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import SceneView from "@arcgis/core/views/SceneView";
import { MUNICH } from "../../../common/scenes";
import { initView, onInit, throwIfAborted, throwIfNotAbortError } from "../../../common/utils";

const landmarks: { name: string; threshold: number; position: Point }[] = [
  {
    name: "Neues Rathaus",
    threshold: 5,
    position: new Point({
      spatialReference: SpatialReference.WebMercator,
      x: 1288578.8301545328,
      y: 6129760.9954138035,
      z: 590,
    }),
  },
  {
    name: "St Peter's Church - Tower 1",
    threshold: 15,
    position: new Point({
      spatialReference: SpatialReference.WebMercator,
      x: 1288301.6231510378,
      y: 6129918.859183111,
      z: 610,
    }),
  },
  {
    name: "St Peter's Church - Tower 2",
    threshold: 15,
    position: new Point({
      spatialReference: SpatialReference.WebMercator,
      x: 1288300.8203933963,
      y: 6129956.649379852,
      z: 610,
    }),
  },
];

onInit("line-of-sight-analysis", () => {
  const view = initView(MUNICH);

  const analysis = new LineOfSightAnalysis({
    targets: new Collection(landmarks.map(({ position }) => new LineOfSightAnalysisTarget({ position }))),
  });
  (view as any).analyses.add(analysis);

  setupPointerMove(view, analysis);
  setupClick(view, analysis);
});

function setupPointerMove(view: SceneView, analysis: LineOfSightAnalysis): void {
  let abortController: AbortController | null = null;

  view.on("pointer-move", async (e: __esri.ViewPointerMoveEvent) => {
    try {
      abortController?.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      const { ground, results } = await view.hitTest(e);
      throwIfAborted(signal);

      const position = results.length === 0 ? ground?.mapPoint : results[0].mapPoint;
      analysis.observer = new LineOfSightAnalysisObserver({ position });
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
}

function setupClick(view: SceneView, analysis: LineOfSightAnalysis): void {
  let abortController: AbortController | null = null;

  view.on("immediate-click", async () => {
    try {
      abortController?.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      const { results } = (await view.whenAnalysisView(analysis)) as __esri.LineOfSightAnalysisView3D;
      throwIfAborted(signal);

      // Make a new analysis which will display only "hits"
      const staticAnalysis = new LineOfSightAnalysis({ observer: analysis.observer });

      // Add all the landmarks which were "hit" to the new analysis.
      for (let i = 0; i < landmarks.length; ++i) {
        const intersection = results.getItemAt(i)?.intersectedLocation;
        const target = analysis.targets.getItemAt(i);
        const landmark = landmarks[i];

        if (!intersection || !target) {
          continue;
        }

        if ((target as any).position.distance(intersection) < landmark.threshold) {
          staticAnalysis.targets.push(target);
          console.log(`${landmark.name} is visible from clicked point.`);
        }
      }

      // Show the new analysis.
      (view as any).analyses.add(staticAnalysis);
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
}
