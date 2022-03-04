import AreaMeasurementAnalysis from "@arcgis/core/analysis/AreaMeasurementAnalysis";
import Polygon from "@arcgis/core/geometry/Polygon";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { DENVER_PARCELS } from "../../../common/scenes";
import {
  addOAuthSupport,
  initView,
  onPlayClick,
  throwIfAborted,
  throwIfNotAbortError,
} from "../../../common/utils";

addOAuthSupport();

let analysis: AreaMeasurementAnalysis | null = null;
let widget: AreaMeasurement3D | null = null;

const view = initView(DENVER_PARCELS);
view.popup.autoOpenEnabled = false;

onPlayClick("add-analysis", setupClick);
onPlayClick("add-to-widget", createWidget);

function setupClick(): void {
  let abortController: AbortController | null = null;

  view.on("click", async (e: __esri.ViewClickEvent) => {
    abortController?.abort();
    const { signal } = (abortController = new AbortController());

    try {
      const { results, ground } = await view.hitTest(e);
      throwIfAborted(signal);

      const clickedGraphic = results.find((r) => r.graphic)?.graphic;
      if (!clickedGraphic || !ground) {
        return;
      }

      let geometry = clickedGraphic.geometry as Polygon;

      // Our polygon don't have elevation values because the parent `FeatureLayer`
      // uses `on-the-ground` elevation mode. Therefore, we need to modify all
      // the vertices to so their Z corresponds to the the absolute elevation of
      // the ground. Essentially, we manually align the geometry to the ground.
      const groundZ = ground.mapPoint.z;
      geometry = geometry.clone();
      geometry.rings = geometry.rings.map((ring) => {
        return ring.map(([x, y]) => [x, y, groundZ]);
      });

      analysis = new AreaMeasurementAnalysis({ geometry });

      (view as any).analyses.removeAll();
      (view as any).analyses.add(analysis);

      if (widget) {
        createWidget();
      }
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
}

function createWidget(): void {
  if (widget) {
    view.ui.remove(widget);
    widget.destroy();
  }

  widget = new AreaMeasurement3D({ view, analysis } as any);
  view.ui.add(widget, "top-right");
}
