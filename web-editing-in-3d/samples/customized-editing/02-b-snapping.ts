import SnappingOptions from "@arcgis/core/views/interactive/snapping/SnappingOptions";
import { drawingSVM } from "./02-a-drawing";
import { floorsLayer } from "./utilities/layers";

export function setupDrawingSnapping(): void {
  drawingSVM.snappingOptions = new SnappingOptions({
    featureSources: [{ layer: floorsLayer }],
    enabled: true,
  });
}
