import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { floorsLayer } from "./utilities/layers";
import { floorSymbol } from "./utilities/symbols";
import { addToolbarAction } from "./utilities/actions";
import { state } from "./utilities/state";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import { watch } from "@arcgis/core/core/reactiveUtils";

// DEMO STEP
// import { setupMoveFloors } from "./04-move floors";

export let drawingSVM: SketchViewModel;

export function setupDrawing(view: SceneView): void {
  addToolbarAction("urban-model-", () => {
    drawingSVM.create("polygon");

    return {
      remove(): void {
        drawingSVM.cancel();
      },
    };
  });

  view.map.add(floorsLayer);

  drawingSVM = new SketchViewModel({
    view,
    layer: floorsLayer,
    polygonSymbol: floorSymbol,
    defaultUpdateOptions: {
      tool: "reshape",
      reshapeOptions: { edgeOperation: "offset" },
    },
  });

  // Initialize from stored state
  for (const floor of state.floors) {
    floorsLayer.add(new Graphic({ geometry: floor, symbol: floorSymbol }));
  }

  // Update stored state on changes
  watch(
    () => floorsLayer.graphics.map((graphic) => graphic.geometry as Polygon).toArray(),
    (value) => (state.floors = value)
  );

  // DEMO STEP
  // setupMoveFloors(drawingSVM);
}
