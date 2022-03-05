import { watch } from "@arcgis/core/core/reactiveUtils";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import { floorsLayer, modificationsLayer, munichLayer } from "./utilities/layers";
import { state } from "./utilities/state";
import { floorSymbol, modificationsSymbol } from "./utilities/symbols";

export function setupStoreState(): void {
  // Set initial modifications from stored state
  if (state.modification) {
    munichLayer.modifications.add(state.modification);
    modificationsLayer.add(
      new Graphic({ geometry: state.modification.geometry, symbol: modificationsSymbol })
    );
  }

  // Update stored state on changes
  munichLayer.modifications.on("change", () => {
    state.modification = munichLayer.modifications.getItemAt(0);
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
}
