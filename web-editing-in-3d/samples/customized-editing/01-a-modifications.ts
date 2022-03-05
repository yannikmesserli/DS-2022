import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { addToolbarAction } from "./utilities/actions";
import { munichLayer, modificationsLayer } from "./utilities/layers";
import { modificationsSymbol } from "./utilities/symbols";

export function setupModifications(view: SceneView): void {
  addToolbarAction("group-x", () => {
    modificationsSVM.create("polygon");

    return {
      remove(): void {
        modificationsSVM.cancel();
      },
    };
  });

  munichLayer.modifications = new SceneModifications();

  view.map.add(modificationsLayer);

  const modificationsSVM = new SketchViewModel({
    view,
    layer: modificationsLayer,
    defaultUpdateOptions: { tool: "reshape" /* , reshapeOptions: { edgeOperation: "offset" } */ },
    polygonSymbol: modificationsSymbol,
  });

  // Emitted when we are creating/drawing a new graphic
  modificationsSVM.on("create", (event) => {
    // We only want one masking area, so we simply remove all modifications when we start the draw
    if (event.state === "start") {
      munichLayer.modifications.removeAll();
      modificationsLayer.removeAll();
    }

    if (event.state === "complete") {
      updateMaskingModification(event.graphic);
    }
  });

  // Emitted when we are updating an existing graphic
  modificationsSVM.on("update", (event) => {
    if (event.state === "complete") {
      updateMaskingModification(event.graphics[0]);
    }
  });
}

function updateMaskingModification(graphic: Graphic): void {
  munichLayer.modifications.removeAll();

  const geometry = graphic?.geometry as Polygon;

  // Add a modification as long as we have a valid polygon of at least 3 vertices
  if (geometry?.rings?.[0].length > 2) {
    munichLayer.modifications.add(new SceneModification({ geometry, type: "replace" }));
  }
}
