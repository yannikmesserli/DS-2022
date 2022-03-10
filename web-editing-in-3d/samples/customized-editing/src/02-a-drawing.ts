import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { floorsLayer } from "./utilities/layers";
import { floorSymbol } from "./utilities/symbols";
import { addToolbarAction } from "./utilities/actions";

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

  // DEMO STEP
  // setupMoveFloors(drawingSVM);
}
