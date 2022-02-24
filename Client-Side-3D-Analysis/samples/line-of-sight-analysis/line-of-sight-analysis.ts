import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Point from "@arcgis/core/geometry/Point";
import LineOfSightAnalysis from "@arcgis/core/analysis/LineOfSightAnalysis";
import Collection from "@arcgis/core/core/Collection";
import LineOfSightAnalysisTarget from "@arcgis/core/analysis/LineOfSightAnalysisTarget";
import { initSanFrancisco } from "../scenes";
import { onInit, throwIfAborted, throwIfNotAbortError } from "../utils";
import Camera from "@arcgis/core/Camera";
import SceneView from "@arcgis/core/views/SceneView";

const spatialReference = SpatialReference.WebMercator;
const landmarks: { name: string; objectId: number; coords: number[] }[] = [
  {
    name: "Transamerica Tower",
    objectId: 66172,
    coords: [-13625812.54317963, 4550529.976478969, 250.3171089636162],
  },
  {
    name: "Ferry Building",
    objectId: 66245,
    coords: [-13624790.00604594, 4550569.041253591, 60.78307350818068],
  },
  {
    name: "Other tower",
    objectId: 66188,
    coords: [-13625913.968927743, 4550099.989219229, 251.6641347669065],
  },
];

onInit("line-of-sight-analysis", () => {
  const { view } = initSanFrancisco();

  view.camera = new Camera({
    position: { spatialReference, x: -13624065, y: 4550413, z: 1463 },
    heading: 269.2925694592433,
    tilt: 42.78218584705901,
  });

  let analysis: LineOfSightAnalysis = new LineOfSightAnalysis({
    targets: new Collection(
      landmarks
        .map(({ coords: [x, y, z] }) => new Point({ x, y, z, spatialReference }))
        .map((position) => new LineOfSightAnalysisTarget({ position }))
    ),
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

      // Set the observer to the map point under the pointer.
      analysis.observer = results.length === 0 ? ground?.mapPoint : results[0].mapPoint;
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

      const { results } = await (view as any).whenAnalysisView(analysis);
      throwIfAborted(signal);

      // Make a new static analysis which will display only rays which hit their
      // respective landmarks.
      const staticAnalysis = new LineOfSightAnalysis({ observer: analysis.observer });

      // Add the targets corresponding to the landmarks which were hit to the
      // static analysis we created above.
      for (let i = 0; i < results.length; ++i) {
        const graphic = results.getItemAt(i)?.intersectedGraphic;
        if (!graphic) {
          continue;
        }

        // If we hit the same graphic as the one we had stored for the landmark
        // we consider that there was a hit.
        if (graphic.getObjectId() === landmarks[i].objectId) {
          staticAnalysis.targets.push(analysis.targets.getItemAt(i));
        }
      }

      (view as any).analyses.add(staticAnalysis);
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
}
